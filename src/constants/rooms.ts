export const ROOM_ORDER = ['drawing-room', 'work-room-1', 'work-room-2'] as const;

export type RoomId = (typeof ROOM_ORDER)[number];
