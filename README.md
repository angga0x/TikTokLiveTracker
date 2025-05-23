# TikTok Live Monitor Dashboard

Aplikasi web full-stack real-time untuk monitoring TikTok Live streams. Menampilkan chat messages, gifts, dan statistik viewer secara real-time menggunakan Node.js, React, dan TikTok Live Connector.

## ✨ Fitur

- **Koneksi Real-time**: Terhubung ke TikTok Live streams menggunakan username
- **Live Chat**: Menampilkan pesan chat real-time dengan avatar dan timestamp
- **Gift Tracker**: Monitor gifts yang dikirim dengan animasi dan nilai coins
- **Live Statistics**: Statistik real-time (viewers, messages, gifts, coins)
- **Activity Feed**: Feed aktivitas terbaru dari chat dan gifts
- **Responsive Design**: Interface yang responsif dengan tema TikTok

## 🛠 Tech Stack

### Backend
- **Node.js** dengan TypeScript
- **Express.js** untuk HTTP server
- **WebSocket** (ws library) untuk komunikasi real-time
- **TikTok Live Connector** untuk integrasi TikTok Live
- **Drizzle ORM** untuk database operations
- **PostgreSQL** untuk penyimpanan data

### Frontend
- **React 18** dengan TypeScript
- **Vite** untuk build tool
- **Tailwind CSS** untuk styling
- **Shadcn/ui** untuk komponen UI
- **TanStack Query** untuk state management
- **Wouter** untuk routing

## 📦 Instalasi

### Prerequisites
- Node.js 20+
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd tiktok-live-monitor
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Buat file .env jika diperlukan
# DATABASE_URL akan diatur secara otomatis untuk PostgreSQL
```

4. **Jalankan aplikasi**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5000`

## 🚀 Cara Penggunaan

1. **Buka aplikasi** di browser
2. **Masukkan username TikTok** yang sedang live streaming
3. **Klik Connect** untuk mulai monitoring
4. **Lihat data real-time**:
   - Chat messages di panel kiri
   - Gifts di panel kanan
   - Live statistics di bagian atas
   - Recent activity di bagian bawah

## 📁 Struktur Project

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities & API client
│   │   └── pages/          # Application pages
├── server/                 # Backend Node.js
│   ├── index.ts           # Entry point
│   ├── routes.ts          # API routes & WebSocket
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types & schemas
│   └── schema.ts          # Database schema & types
└── package.json           # Dependencies & scripts
```

## 🔧 Scripts yang Tersedia

```bash
# Development
npm run dev          # Jalankan server development

# Production
npm run build        # Build aplikasi untuk production
npm start           # Jalankan server production

# Database
npm run db:push     # Apply database schema changes
```

## 🎨 Komponen Utama

### ConnectionForm
- Input untuk username TikTok
- Status koneksi dan tombol connect
- Handling error dan loading states

### LiveStats
- Menampilkan viewer count, message count, gift count, coin count
- Update real-time melalui WebSocket
- Format angka dengan K/M untuk readability

### LiveChat
- Scroll otomatis untuk pesan baru
- Avatar dengan warna unik per user
- Timestamp dan animasi slide-in

### LiveGifts
- Animasi pop untuk gift baru
- Emoji dan tema warna sesuai jenis gift
- Menampilkan count dan nilai coins

### ActivityFeed
- Kombinasi aktivitas chat dan gifts
- Timeline dengan indikator warna
- Auto-scroll dan limit 10 aktivitas terbaru

## 🌐 API Endpoints

```
GET /api/streams/:username          # Get stream info
GET /api/streams/:username/messages # Get chat messages
GET /api/streams/:username/gifts    # Get gifts
WebSocket /ws                       # Real-time communication
```

## 🔌 WebSocket Events

### Client to Server
- `connect-tiktok`: { username: string }
- `disconnect-tiktok`: void

### Server to Client
- `connection-status`: { status, username?, error? }
- `stream-stats`: { viewerCount, messageCount, giftCount, coinCount }
- `new-chat`: ChatMessage
- `new-gift`: Gift
- `error`: { message }

## 🎯 Deployment

Aplikasi ini dirancang untuk deployment di Replit dengan konfigurasi minimal:

1. **Database**: Menggunakan built-in PostgreSQL Replit
2. **Environment**: Node.js 20 runtime
3. **Port**: Aplikasi berjalan di port 5000
4. **Build**: Frontend assets di-bundle ke `dist/public`

## 🔧 Troubleshooting

### Koneksi TikTok Live Gagal
- Pastikan username benar dan sedang live
- Cek koneksi internet
- Beberapa stream mungkin memiliki pembatasan akses

### WebSocket Disconnect
- Aplikasi akan otomatis reconnect
- Maksimal 5 reconnection attempts
- Interval reconnect meningkat secara exponential

### Performance Issues
- Chat dan gift history dibatasi 50 item terbaru
- Activity feed dibatasi 10 item terbaru
- Auto-cleanup untuk mencegah memory leaks

## 📝 License

MIT License - silakan digunakan untuk pembelajaran dan proyek personal.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.