import dgram from 'dgram'
import { DiscoveryMessage } from './types'

export class Discovery {
  // Add new device ids here
  private devices = new Set<string>(['red-gui'])
  private socket = dgram.createSocket('udp4')

  peers = new Map<string, string>()

  constructor(
    private readonly broadcastAddress = '255.255.255.255',
    private readonly port = 41234,
    private readonly id = 'blue-gui',
    private readonly httpPort = 3003
  ) {}

  start() {
    this.socket.on('message', (data, rinfo) => {
      console.log(`[${this.id}] RECEIVED UDP`, data.toString(), rinfo.address, rinfo.port)

      this.handleMessage(data, rinfo)
    })

    this.socket.on('listening', () => {
      console.log(`[${this.id}] listening`, this.socket.address())
    })

    this.socket.on('error', (err) => {
      console.error(`[${this.id}] socket error`, err)
    })

    this.socket.on('close', () => {
      console.log(`[${this.id}] socket closed`)
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
      id: this.id,
      port: this.httpPort
    }

    const broadcastInterval = setInterval(() => {
      if (this.devices.size == this.peers.size) {
        clearInterval(broadcastInterval)
        console.log('All peers discovered')
        return
      }

      console.log('Broadcasting ip')

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
          break
        case 'DISCOVER':
          this.handleResponse(message, rinfo)
          this.handleRequest(rinfo)
          break
        default:
          console.log('Error: unknown message type: ', message.type)
      }
    } catch {
      console.error('Invalid discovery packet')
    }
  }

  private handleResponse(message: DiscoveryMessage, rinfo: dgram.RemoteInfo) {
    // return if not in device list or already found
    if (!this.devices.has(message.id) || this.peers.has(message.id)) return

    const ip = `${rinfo.address}:${message.port}`
    this.peers.set(message.id, ip)
    console.log('Discovered: ', message.id, ip)
  }

  private handleRequest(rinfo: dgram.RemoteInfo) {
    const message: DiscoveryMessage = {
      type: 'DISCOVER_RESPONSE',
      id: this.id,
      port: this.httpPort
    }

    const data = Buffer.from(JSON.stringify(message))
    this.socket.send(data, rinfo.port, rinfo.address)
  }
}
