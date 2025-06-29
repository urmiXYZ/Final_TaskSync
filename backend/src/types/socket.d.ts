import { DefaultEventsMap } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: {
      id: number;
      username?: string;
      // add any other JWT payload properties you use
    };
  }
}
