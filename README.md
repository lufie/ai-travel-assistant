# AI Travel Assistant

A smart travel assistant powered by AI, helping users plan their perfect trip.

[![Deployment](https://img.shields.io/badge/vercel-deployed-blue?logo=vercel&label=Vercel)](https://vercel.com/new)
[![License](https://img.shields.io/badge/license-MIT-green?logo=mit)](LICENSE)

## 📋 Features

- 🗺️ Interactive Map with real-time search
- 🤖 AI-powered travel advice (Doubao AI)
- 💾 Data persistence with Supabase
- 🌐 Multi-language support (Chinese/English)
- 💳 Premium subscription system
- 📱 Responsive design for mobile and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Supabase account
- Doubao API key

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd ai-travel-assistant

# Install dependencies
npm install

# Configure environment variables
cp .env.template .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Configuration
VITE_DOUBAO_API_KEY=your-doubao-api-key
```

Get API keys from:
- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **Doubao AI**: [volcengine.com](https://console.volcengine.com/ark)

## 🏗️ Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Deploy to Vercel (Recommended)

![Deploy with Vercel](https://vercel.com/button)(https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-travel-assistant)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

**Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

**Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)

### Deploy to Cloudflare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy to Cloudflare Pages
wrangler pages project create ai-travel-assistant
wrangler pages deploy dist --project-name=ai-travel-assistant
```

**Cloudflare Dashboard**: [dash.cloudflare.com](https://dash.cloudflare.com)

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📂 Project Structure

```
ai-travel-assistant/
├── components/          # React components
│   ├── ChatView.tsx          # AI chat interface
│   ├── DetailView.tsx         # Destination details
│   ├── MapView.tsx           # Map component
│   ├── SubscriptionView.tsx   # Subscription plans
│   ├── UserCenterView.tsx     # User dashboard
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.tsx        # Authentication state
│   └── SubscriptionContext.tsx # Subscription state
├── services/            # API and data services
│   ├── ai.ts                # AI service
│   ├── auth.ts              # Authentication
│   ├── data.ts              # Data persistence
│   └── stripe.ts            # Payment service
├── App.tsx              # Main application
├── package.json           # Dependencies
└── vite.config.ts         # Build configuration
```

## 🎨 Technology Stack

- **Framework**: React 19.2.3
- **Language**: TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN)
- **Database**: Supabase
- **Maps**: Leaflet
- **Icons**: Lucide React
- **AI**: Doubao (Volcengine)
- **Deployment**: Vercel/Netlify/Cloudflare Pages

## 🌐 Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 💬 Support

For support and questions:
- Create an issue in the repository
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Contact development team

---

**Built with ❤️ for travelers everywhere**

<!-- redeploy trigger -->
