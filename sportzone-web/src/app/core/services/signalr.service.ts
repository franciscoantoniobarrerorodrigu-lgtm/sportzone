import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  isConnected = signal<boolean>(false);

  constructor() {}

  async startConnection(hubName: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/${hubName}`)
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      console.log(`SignalR connected to ${hubName}`);
    } catch (err) {
      console.error('SignalR connection error:', err);
      this.isConnected.set(false);
    }

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      console.log('SignalR reconnected');
    });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
      console.log('SignalR disconnected');
    });
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }

  on(eventName: string, callback: (...args: any[]) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on(eventName, callback);
    }
  }

  off(eventName: string): void {
    if (this.hubConnection) {
      this.hubConnection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (this.hubConnection) {
      return await this.hubConnection.invoke(methodName, ...args);
    }
  }
}
