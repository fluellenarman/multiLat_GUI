import dgram from 'dgram'
import { DiscoveryMessage } from './types'

export class Discovery {
  // Add new device ids here
  private devices = new Set<string>(['red-gui', 'los-tracker'])
  private peers = new Map<string, dgram.RemoteInfo>()
  private socket = dgram.createSocket('udp4')

  constructor(
    private readonly broadcastAddress = '255.255.255.255',
    private readonly port = 41234,
    private readonly id = 'blue-gui'
  ) {}

  start() {
    this.socket.on('message', (data, rinfo) => {
      this.handleMessage(data, rinfo)
    })

    this.socket.bind(this.port, () => {
      this.socket.setBroadcast(true)
      console.log(`Discovery listening on UDP ${this.port}`)

      this.broadcast()
    })
  }

  private broadcast() {
    const message: DiscoveryMessage = {
      type: 'DISCOVER',
      id: this.id
    }

    const broadcastInterval = setInterval(() => {
      if (this.devices.size == this.peers.size) {
        clearInterval(broadcastInterval)
      }

      const data = Buffer.from(JSON.stringify(message))
      this.socket.send(data, this.port, this.broadcastAddress)
    }, 5000)
  }

  private handleMessage(data: Buffer, rinfo: dgram.RemoteInfo) {
    try {
      const message = JSON.parse(data.toString()) as DiscoveryMessage

      if (message.id === this.id) {
        return
      }

      switch (message.type) {
        case 'DISCOVER_RESPONSE':
          this.handleResponse(message, rinfo)
        case 'DISCOVER':
          this.handleResponse(message, rinfo)
          this.handleRequest(rinfo)
      }
    } catch {
      console.error('Invalid discovery packet')
    }
  }

  private handleResponse(message: DiscoveryMessage, rinfo: dgram.RemoteInfo) {
    // return if not in device list or already found
    if (!this.devices.has(message.id) || this.peers.has(message.id)) return

    this.peers.set(message.id, rinfo)
    console.log('Discovered: ', message.id, rinfo)
  }

  private handleRequest(rinfo: dgram.RemoteInfo) {
    const message: DiscoveryMessage = {
      type: 'DISCOVER_RESPONSE',
      id: this.id
    }

    const data = Buffer.from(JSON.stringify(message))
    this.socket.send(data, rinfo.port, rinfo.address)
  }
}
