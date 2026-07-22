import type { ContextBlock } from "../types";

export function getDefaultBlocks(dayOfWeek: number): ContextBlock[] {
  // Monday = 0, Tuesday = 1, Wednesday = 2, Thursday = 3, Friday = 4, Saturday = 5, Sunday = 6
  if (dayOfWeek === 5) {
    // Saturday
    return [
      {
        id: "health",
        name: "Health / Body",
        startTime: "07:00",
        endTime: "09:15",
        bufferMinutes: 15,
        sphereNames: ["Health", "Sport"],
      },
      {
        id: "space",
        name: "Environment / Space",
        startTime: "09:30",
        endTime: "12:30",
        bufferMinutes: 15,
        sphereNames: ["Environment / Space"],
      },
      {
        id: "family",
        name: "Family / Romance",
        startTime: "13:00",
        endTime: "19:45",
        bufferMinutes: 15,
        sphereNames: ["Family & Friends", "Romance"],
      },
      {
        id: "kaizen",
        name: "Kaizen (System)",
        startTime: "20:00",
        endTime: "20:45",
        bufferMinutes: 15,
        sphereNames: [],
      },
      {
        id: "recovery",
        name: "Recovery",
        startTime: "21:00",
        endTime: "22:45",
        bufferMinutes: 15,
        sphereNames: ["Health"],
      },
    ];
  }

  if (dayOfWeek === 6) {
    // Sunday
    return [
      {
        id: "health",
        name: "Health / Body",
        startTime: "07:00",
        endTime: "09:15",
        bufferMinutes: 15,
        sphereNames: ["Health", "Sport"],
      },
      {
        id: "hobby",
        name: "Hobby",
        startTime: "09:30",
        endTime: "14:00",
        bufferMinutes: 15,
        sphereNames: ["Personal Growth", "Fun & Recreation"],
      },
      {
        id: "family",
        name: "Family / Romance",
        startTime: "14:30",
        endTime: "19:45",
        bufferMinutes: 15,
        sphereNames: ["Family & Friends", "Romance"],
      },
      {
        id: "kaizen",
        name: "Kaizen (System)",
        startTime: "20:00",
        endTime: "20:45",
        bufferMinutes: 15,
        sphereNames: [],
      },
      {
        id: "recovery",
        name: "Recovery",
        startTime: "21:00",
        endTime: "22:45",
        bufferMinutes: 15,
        sphereNames: ["Health"],
      },
    ];
  }

  const isFamilyDay = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;

  const baseBlocks = [
    {
      id: "health",
      name: "Health / Body",
      startTime: "07:00",
      endTime: "09:15",
      bufferMinutes: 15,
      sphereNames: ["Health", "Sport"],
    },
    {
      id: "work",
      name: "Business / Work",
      startTime: "09:30",
      endTime: "17:30",
      bufferMinutes: 30,
      sphereNames: ["Work", "Trading", "Finance"],
    },
  ];

  const eveningBlocks: ContextBlock[] = isFamilyDay
    ? [
        {
          id: "family",
          name: "Family / Romance",
          startTime: "18:00",
          endTime: "19:45",
          bufferMinutes: 15,
          sphereNames: ["Family & Friends", "Romance"],
        },
      ]
    : [
        {
          id: "growth",
          name: "Personal Growth",
          startTime: "18:00",
          endTime: "18:45",
          bufferMinutes: 15,
          sphereNames: ["Personal Growth"],
        },
        {
          id: "hobby",
          name: "Hobby",
          startTime: "19:00",
          endTime: "19:45",
          bufferMinutes: 15,
          sphereNames: ["Fun & Recreation", "Environment / Space"],
        },
      ];

  return [
    ...baseBlocks,
    ...eveningBlocks,
    {
      id: "kaizen",
      name: "Kaizen (System)",
      startTime: "20:00",
      endTime: "20:45",
      bufferMinutes: 15,
      sphereNames: [], // Meta block for planning
    },
    {
      id: "recovery",
      name: "Recovery",
      startTime: "21:00",
      endTime: "22:45",
      bufferMinutes: 15,
      sphereNames: ["Health"],
    },
  ];
}

export interface TimeBlockValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateTaskTime(
  sphereName: string,
  plannedDate: Date,
  plannedEndDate: Date | null,
  contextBlocks: ContextBlock[]
): TimeBlockValidationResult {
  // Find blocks that allow this sphere and are enabled
  const matchingBlocks = contextBlocks.filter(
    (block) => block.sphereNames.includes(sphereName) && block.enabled !== false
  );

  if (matchingBlocks.length === 0) {
    return { isValid: true }; // No restrictions for this sphere
  }

  const taskStart = plannedDate.getHours() * 60 + plannedDate.getMinutes();
  
  // If no end date, assume 60 mins duration
  const taskEnd = plannedEndDate
    ? plannedEndDate.getHours() * 60 + plannedEndDate.getMinutes()
    : taskStart + 60;

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const fitsAny = matchingBlocks.some((block) => {
    const blockStart = parseTimeToMinutes(block.startTime);
    const blockEnd = parseTimeToMinutes(block.endTime) + block.bufferMinutes;

    // Allow 30 minutes tolerance on both sides
    const allowedStart = blockStart - 30;
    const allowedEnd = blockEnd + 30;

    return taskStart >= allowedStart && taskEnd <= allowedEnd;
  });

  if (!fitsAny) {
    const blockNames = matchingBlocks
      .map((block) => `"${block.name}" (${block.startTime} - ${block.endTime})`)
      .join(" or ");
    return {
      isValid: false,
      message: `Sphere "${sphereName}" is only allowed within blocks: ${blockNames}. (30-minute tolerance allowed).`,
    };
  }

  return { isValid: true };
}
