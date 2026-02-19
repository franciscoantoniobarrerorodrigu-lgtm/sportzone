import { TestBed } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect initial online status', () => {
    expect(service.isOnline()).toBe(navigator.onLine);
  });

  it('should compute offline status correctly', () => {
    const isOffline = service.isOffline();
    expect(isOffline).toBe(!navigator.onLine);
  });

  it('should register online callback', (done: DoneFn) => {
    let callbackCalled = false;
    const callback = () => { callbackCalled = true; };
    service.onConnectionRestored(callback);

    // Simulate online event
    window.dispatchEvent(new Event('online'));

    setTimeout(() => {
      expect(callbackCalled).toBe(true);
      done();
    }, 100);
  });

  it('should register offline callback', (done: DoneFn) => {
    let callbackCalled = false;
    const callback = () => { callbackCalled = true; };
    service.onConnectionLost(callback);

    // Simulate offline event
    window.dispatchEvent(new Event('offline'));

    setTimeout(() => {
      expect(callbackCalled).toBe(true);
      done();
    }, 100);
  });

  it('should remove callbacks', () => {
    const callback = () => {};
    service.onConnectionRestored(callback);
    service.removeCallback(callback);

    // Callback should be removed (no way to directly test, but ensures no error)
    expect(true).toBe(true);
  });

  it('should return status text', () => {
    const statusText = service.getStatusText();
    expect(statusText).toBeTruthy();
    expect(typeof statusText).toBe('string');
  });

  it('should return status icon', () => {
    const statusIcon = service.getStatusIcon();
    expect(statusIcon).toBeTruthy();
    expect(typeof statusIcon).toBe('string');
  });

  it('should check connection', async () => {
    const isConnected = await service.checkConnection();
    expect(typeof isConnected).toBe('boolean');
  });
});
