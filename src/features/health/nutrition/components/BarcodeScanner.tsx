"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";
import { BarcodeDetector } from "barcode-detector/pure";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  // 1. Hooks
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId: number;
    let stopped = false;
    // Ponyfill: uses the native BarcodeDetector where available, falls back to a
    // WASM decoder (zxing-wasm) on browsers without it — notably Safari/iOS.
    const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });

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
        setCameraError("Немає доступу до камери. Введіть код вручну.");
      }
    }

    async function scan() {
      if (stopped || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results[0]?.rawValue) {
          onDetectedRef.current(results[0].rawValue);
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
    // Mount-once: camera/detector setup shouldn't restart on every onDetected identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Handlers
  const handleManualSubmit = () => {
    if (manualCode.trim()) onDetected(manualCode.trim());
  };

  if (cameraError) {
    return (
      <div className="flex flex-col gap-3 items-center p-6 text-center">
        <CameraOff size={24} className="text-zinc-500" />
        <p className="text-caption">{cameraError}</p>
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
      <p className="text-caption text-center">Наведіть камеру на штрихкод продукту</p>
    </div>
  );
}
