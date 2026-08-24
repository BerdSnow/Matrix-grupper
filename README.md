# 🧩 Matrix Grouping App (Jigsaw Classroom)

A real-time collaborative web application designed for interactive classroom group assignments following the **Jigsaw Learning Technique**. Instructors can generate dynamic exercise lobbies with live QR codes, and students are evenly distributed across problem sets before being transposed into heterogeneous matrix groups with a single click.

---

## ✨ Key Features

- **Dynamic Balanced Join:** Ensures that student counts across all exercises never differ by more than 1 ($\Delta \le 1$), regardless of how many students join.
- **Real-Time QR Code Join:** Students scan an on-screen QR code from their mobile devices or laptops to enter the lobby without authentication.
- **Phase 1 (Expert Groups):** Students receive their assigned exercise and see real-time peer rosters working on the same problem.
- **Phase 2 (Matrix Regrouping):** With one click from the instructor board, the server shuffles and transposes buckets to form balanced groups containing one expert from each exercise.
- **Zero Configuration Real-Time Sync:** Powered by Socket.io WebSockets for instant, low-latency state updates.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Real-Time Engine:** [Socket.io](https://socket.io/) (Custom Node.js HTTP server)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons & QR:** [Lucide React](https://lucide.dev/), [qrcode.react](https://github.com/zpao/qrcode.react)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/matrix-grouping-app.git](https://github.com/YOUR_USERNAME/matrix-grouping-app.git)
   cd matrix-grouping-app
2. **Install dependencies:**
   ```bash
   npm install
3. **Start the development server:**
   ```bash
   npm run dev
4. **Open the application:**
Instructor board: http://localhost:3000
Test student join: Open private/incognito tabs at http://localhost:3000
If using github codespace make sure to set port to public
