import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface User {
  id: string;
  fullName: string;
  age: string;
  gender: string;
  isPaired: boolean;
}

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly users: Map<string, User> = new Map();

  handleConnection(socket: Socket): void {
    console.log(`Client connected: ${socket.id}`);
    this.connectedClients.set(socket.id, socket);

    socket.on('register', (data: { fullName: string; age: string; gender: string }) => {
      this.users.set(socket.id, {
        id: socket.id,
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        isPaired: false,
      });
      console.log(`User registered: ${socket.id}`);
      console.log(this.users.get(socket.id))
    });

    socket.on('findMatch', () => {
      const user = this.users.get(socket.id);
      if (!user || user.isPaired) {
        socket.emit('matchError', { message: 'Unable to find a match at the moment.' });
        return;
      }

      const availableUser = Array.from(this.users.values()).find(
        (u) => !u.isPaired && u.id !== user.id,
      );

      if (availableUser) {
        // Pair users
        user.isPaired = true;
        availableUser.isPaired = true;

        // Notify both users
        const peerSocket = this.connectedClients.get(availableUser.id);
        if (peerSocket) {
          peerSocket.emit('match', {
            peer: {
              id: user.id,
              fullName: user.fullName,
              age: user.age,
              gender: user.gender,
            },
          });
          socket.emit('match', {
            peer: {
              id: availableUser.id,
              fullName: availableUser.fullName,
              age: availableUser.age,
              gender: availableUser.gender,
            },
          });
        }
      } else {
        socket.emit('waitingForMatch');
      }
    });

    socket.on('message', (data: { to: string; message: string }) => {
      const recipientSocket = this.connectedClients.get(data.to);
      if (recipientSocket) {
        recipientSocket.emit('message', { from: socket.id, message: data.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      const user = this.users.get(socket.id);
      if (user && user.isPaired) {
        const peerSocket = this.connectedClients.get(user.id);
        if (peerSocket) {
          peerSocket.emit('peerDisconnected');
        }
      }
      this.connectedClients.delete(socket.id);
      this.users.delete(socket.id);
    });
  }
}
