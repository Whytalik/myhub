"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
}

function getBarcodeDetectorCtor(): BarcodeDetectorConstructor | null {
  return (
    (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector ?? null
  );
}

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  // 1. Hooks
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const isSupported = typeof window !== "undefined" && getBarcodeDetectorCtor() !== null;

  useEffect(() => {
    if (!isSupported) return;

    let stream: MediaStream | null = null;
    let rafId: number;
    let stopped = false;
    const DetectorCtor = getBarcodeDetectorCtor();
    if (!DetectorCtor) return;
    const detector = new DetectorCtor({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        scan();
      } catch {
        setError("Немає доступу до камери. Введіть код вручну.");
      }
    }

    async function scan() {
      if (stopped || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results[0]?.rawValue) {
          onDetected(results[0].rawValue);
          return;
        }
      } catch {
        // transient decode error — keep scanning
      }
      rafId = requestAnimationFrame(scan);
    }

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // 3. Handlers
  const handleManualSubmit = () => {
    if (manualCode.trim()) onDetected(manualCode.trim());
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-3 items-center p-6 text-center">
        <CameraOff size={24} className="text-zinc-500" />
        <p className="text-caption">
          Цей браузер не підтримує сканування камерою. Введіть штрихкод вручну.
        </p>
        <div className="flex gap-2 w-full">
          <Input
            type="text"
            inputMode="numeric"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Штрихкод"
            className="flex-1"
          />
          <Button type="button" size="md" onClick={handleManualSubmit}>
            OK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-16 border-2 border-accent-nutrition/70 rounded-lg" />
      </div>
      {error && <p className="text-caption text-rose-400">{error}</p>}
      <p className="text-caption text-center">Наведіть камеру на штрихкод продукту</p>
    </div>
  );
}
