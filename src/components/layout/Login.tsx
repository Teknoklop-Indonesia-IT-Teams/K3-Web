// Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Lock,
  Heart,
  Activity,
  Zap,
  Puzzle,
  Sparkles,
} from "lucide-react";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Simpan data ke localStorage DULU
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        // Tunggu 2 detik untuk loading animation
        setTimeout(() => {
          setShowLoading(false);
          setLoading(false);

          // Navigate dan refresh SEKALIGUS
          navigate("/", { replace: true });
          window.location.reload(); // Langsung reload, tidak perlu setTimeout lagi
        }, 2000);
      } else {
        setShowLoading(false);
        setLoading(false);
        alert(data.error || "Login gagal");
      }
    } catch (error) {
      console.error("Login error:", error);
      setShowLoading(false);
      setLoading(false);
      alert("Terjadi kesalahan saat login");
    }
  };

  // Loading Animation dengan tema putih
  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_50%,transparent_52%)] bg-[length:60px_60px] animate-grid-move"></div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full animate-float-particle ${
              i % 4 === 0
                ? "bg-blue-200"
                : i % 4 === 1
                ? "bg-slate-200"
                : i % 4 === 2
                ? "bg-amber-200"
                : "bg-gray-200"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Main Puzzle K3 Animation */}
        <div className="relative mb-20">
          {/* Connection Lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse-connection"></div>

          <div className="flex justify-center items-center space-x-16 mb-16">
            {/* Huruf K - Puzzle Pieces */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-xl opacity-50 animate-pulse-slow"></div>

              {/* Puzzle Container untuk K */}
              <div className="relative w-40 h-40">
                {/* Background Outline */}
                <div className="absolute inset-0 border-4 border-dashed border-blue-100 rounded-2xl animate-pulse-very-slow"></div>

                {/* Piece 1 - Top Left */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-tl-2xl animate-puzzle-assemble-k1 shadow-lg border-2 border-blue-400"></div>

                {/* Piece 2 - Top Right */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-600 to-blue-700 rounded-tr-2xl animate-puzzle-assemble-k2 shadow-lg border-2 border-blue-500"></div>

                {/* Piece 3 - Middle Left */}
                <div className="absolute top-10 left-0 w-16 h-20 bg-gradient-to-b from-blue-400 to-blue-500 rounded-bl-2xl animate-puzzle-assemble-k3 shadow-lg border-2 border-blue-300"></div>

                {/* Piece 4 - Bottom Right */}
                <div className="absolute bottom-0 right-5 w-16 h-20 bg-gradient-to-t from-blue-700 to-blue-800 rounded-br-2xl animate-puzzle-assemble-k4 shadow-lg border-2 border-blue-600"></div>

                {/* Connection Points */}
                <div className="absolute top-10 left-20 w-3 h-3 bg-amber-400 rounded-full animate-ping-slow shadow-lg"></div>
                <div className="absolute bottom-10 right-5 w-3 h-3 bg-amber-400 rounded-full animate-ping-slow-delay shadow-lg"></div>
              </div>

              {/* Animated K Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-white animate-bounce-slow z-20 drop-shadow-2xl">
                  K
                </span>
              </div>

              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-sparkle-slow" />
              <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-blue-400 animate-sparkle-slow-delay" />
            </div>

            {/* Angka 3 - Puzzle Pieces */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-slate-100 rounded-2xl blur-xl opacity-50 animate-pulse-slow-delay"></div>

              {/* Puzzle Container untuk 3 */}
              <div className="relative w-40 h-40">
                {/* Background Outline */}
                <div className="absolute inset-0 border-4 border-dashed border-slate-100 rounded-2xl animate-pulse-very-slow"></div>

                {/* Piece 1 - Top Curve */}
                <div className="absolute top-0 left-5 w-30 h-20 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-2xl animate-puzzle-assemble-31 shadow-lg border-2 border-slate-500"></div>

                {/* Piece 2 - Middle */}
                <div className="absolute top-8 left-10 w-20 h-10 bg-gradient-to-r from-slate-500 to-slate-600 animate-puzzle-assemble-32 shadow-lg border-2 border-slate-400"></div>

                {/* Piece 3 - Bottom Curve */}
                <div className="absolute bottom-0 left-5 w-30 h-20 bg-gradient-to-t from-slate-700 to-slate-800 rounded-b-2xl animate-puzzle-assemble-33 shadow-lg border-2 border-slate-600"></div>

                {/* Piece 4 - Inner Curve Top */}
                <div className="absolute top-5 left-15 w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full animate-puzzle-assemble-34 shadow-lg border-2 border-slate-300"></div>

                {/* Piece 5 - Inner Curve Bottom */}
                <div className="absolute bottom-5 left-15 w-10 h-10 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-full animate-puzzle-assemble-35 shadow-lg border-2 border-slate-700"></div>
              </div>

              {/* Animated 3 Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-white animate-bounce-slow-delay z-20 drop-shadow-2xl">
                  3
                </span>
              </div>

              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-amber-400 animate-sparkle-slow-delay-2" />
              <Sparkles className="absolute -bottom-2 -right-2 h-6 w-6 text-slate-400 animate-sparkle-slow" />
            </div>
          </div>

          {/* Central Connection Animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-3">
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping-slow shadow-lg"></div>
              <div className="w-4 h-4 bg-slate-400 rounded-full animate-ping-slow-delay shadow-lg"></div>
              <div className="w-4 h-4 bg-amber-400 rounded-full animate-ping-slow-delay-2 shadow-lg"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-ping-slow-delay-3 shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* TEKNOKLOP Text */}
        <div className="mb-16">
          <h2 className="text-6xl font-black mb-8">
            <span className="animate-tekno-enhanced bg-gradient-to-r from-blue-600 via-slate-600 to-amber-600 bg-clip-text text-transparent">
              TEKNO
            </span>
            <span className="animate-klop-enhanced bg-gradient-to-r from-slate-600 via-blue-600 to-amber-500 bg-clip-text text-transparent">
              KLOP
            </span>
          </h2>

          {/* Puzzle Piece Underline */}
          <div className="flex justify-center space-x-2 mb-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-4 rounded-full animate-puzzle-underline-enhanced transform rotate-45 ${
                  i % 3 === 0
                    ? "bg-blue-500"
                    : i % 3 === 1
                    ? "bg-slate-500"
                    : "bg-amber-500"
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg font-medium animate-fade-in-delayed">
            WEBSITE MANAGEMENT K3 TEKNOKLOP
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-10">
          {/* 3D Puzzle Piece Loading */}
          <div className="flex space-x-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 transform rotate-45 animate-puzzle-load-enhanced shadow-lg border-2 ${
                  i % 4 === 0
                    ? "bg-blue-500 border-blue-400"
                    : i % 4 === 1
                    ? "bg-slate-500 border-slate-400"
                    : i % 4 === 2
                    ? "bg-amber-500 border-amber-400"
                    : "bg-gray-500 border-gray-400"
                }`}
                style={{
                  animationDelay: `${i * 0.4}s`,
                  transformStyle: "preserve-3d",
                  transform: "rotate(45deg) perspective(100px)",
                }}
              />
            ))}
          </div>

          {/* Progress Bar dengan Puzzle Style */}
          <div className="w-120 h-4 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 via-slate-500 to-amber-500 rounded-full animate-progress-puzzle-enhanced relative">
              {/* Puzzle Notches */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0 w-2 bg-white opacity-60 transform skew-x-12"
                  style={{ left: `${(i + 1) * 20}%` }}
                />
              ))}

              {/* Moving Highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></div>
            </div>

            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 animate-pulse-slow">
                MEMUAT SISTEM...
              </span>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-gray-700 text-xl font-semibold">
            <div className="flex items-center justify-center space-x-3">
              <Puzzle className="h-7 w-7 text-blue-500 animate-bounce-rotate" />
              <span className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-blue-500">
                MEMUAT SISTEM...
              </span>
              <Puzzle className="h-7 w-7 text-slate-500 animate-bounce-rotate-delay" />
            </div>
          </div>
        </div>

        {/* Safety Messages dengan Icons */}
        <div className="mt-16 grid grid-cols-4 gap-8 text-sm text-gray-600">
          {[
            { icon: Shield, color: "blue", text: "Keamanan", delay: "0.8s" },
            { icon: Heart, color: "slate", text: "Kesehatan", delay: "1.2s" },
            { icon: Zap, color: "amber", text: "Efisiensi", delay: "1.6s" },
            {
              icon: Activity,
              color: "gray",
              text: "Monitoring",
              delay: "2.0s",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center animate-fade-in-up"
              style={{ animationDelay: item.delay }}
            >
              <div
                className={`w-12 h-12 bg-${item.color}-50 rounded-2xl flex items-center justify-center mb-3 shadow-lg border border-${item.color}-200 transform hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className={`h-6 w-6 text-${item.color}-500`} />
              </div>
              <p className="text-center whitespace-pre-line font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showLoading && <LoadingAnimation />}

      <div className="min-h-screen flex items-center justify-center bg-white">
        {/* Background Puzzle Decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          {/* Animated Floating Puzzle Pieces */}
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-20 h-20 transform rotate-45 opacity-20 animate-float-puzzle-enhanced border-2 ${
                i % 4 === 0
                  ? "bg-blue-100 border-blue-200"
                  : i % 4 === 1
                  ? "bg-slate-100 border-slate-200"
                  : i % 4 === 2
                  ? "bg-amber-100 border-amber-200"
                  : "bg-gray-100 border-gray-200"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${20 + Math.random() * 15}s`,
              }}
            />
          ))}
        </div>

        {/* Main Container */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl w-full max-w-md mx-4 overflow-hidden relative z-10">
          {/* Header dengan Theme Putih */}
          <div className="bg-gradient-to-r from-blue-500 via-slate-600 to-amber-500 p-8 text-center relative overflow-hidden">
            {/* Puzzle Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.4)_50%,transparent_55%)] bg-[length:50px_50px] animate-grid-move-slow"></div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-blue-400 via-slate-500 to-amber-400 rounded-3xl opacity-30 animate-border-rotate"></div>

            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/95 rounded-2xl transform rotate-45 flex items-center justify-center mr-4 shadow-lg border border-gray-200">
                    <Puzzle className="h-7 w-7 text-blue-500 transform -rotate-45" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping-slow shadow-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-slate-400 rounded-full animate-ping-slow-delay shadow-lg"></div>
                </div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">
                  <span className="text-blue-100 animate-glow-blue">K</span>
                  <span className="text-slate-100 animate-glow-slate">3</span>
                  <span className="ml-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    TEKNOKLOP
                  </span>
                </h1>
              </div>
              <p className="text-blue-100/90 text-sm font-medium tracking-wide">
                Sistem Manajemen K3 Terintegrasi
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleLogin}>
              {/* Username Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <User className="h-4 w-4 inline mr-2 text-blue-500 animate-pulse-slow" />
                  <span className="bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">
                    USERNAME
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition duration-500 shadow-sm"
                    placeholder="Masukkan username Anda"
                    required
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-4 w-4 text-blue-400 animate-sparkle-slow" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Lock className="h-4 w-4 inline mr-2 text-slate-500 animate-pulse-slow-delay" />
                  <span className="bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
                    PASSWORD
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition duration-500 shadow-sm"
                    placeholder="Masukkan password Anda"
                    required
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-4 w-4 text-slate-400 animate-sparkle-slow-delay" />
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-slate-600 to-amber-500 hover:from-blue-600 hover:via-slate-700 hover:to-amber-600 text-white font-bold py-5 px-4 rounded-2xl transition duration-500 transform hover:scale-[1.02] disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none shadow-lg relative overflow-hidden group"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-3"></div>
                    <span className="text-lg font-semibold">
                      MASUK KE SISTEM...
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 text-lg font-semibold drop-shadow-lg">
                      MASUK SISTEM
                    </span>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.3)_50%,transparent_55%)] bg-[length:60px_60px] transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-semibold">
                  PT. Teknoklop Indonesia
                </p>
                <p className="text-gray-500 text-xs mt-2 flex items-center justify-center space-x-1">
                  <Puzzle className="h-3 w-3 text-blue-500 animate-pulse-slow" />
                  <span>Sistem Manajemen K3 Terintegrasi</span>
                  <Puzzle className="h-3 w-3 text-slate-500 animate-pulse-slow-delay" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        /* Grid Animation */
        @keyframes grid-move {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(60px) translateY(60px); }
        }
        .animate-grid-move {
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(50px); }
        }
        .animate-grid-move-slow {
          animation: grid-move-slow 15s linear infinite;
        }

        /* Puzzle Assembly Animations */
        @keyframes puzzle-assemble-k1 {
          0% { transform: translate(-80px, -80px) rotate(-90deg) scale(0.5); opacity: 0; }
          15% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-puzzle-assemble-k1 {
          animation: puzzle-assemble-k1 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-k2 {
          0% { transform: translate(80px, -80px) rotate(90deg) scale(0.5); opacity: 0; }
          20% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-puzzle-assemble-k2 {
          animation: puzzle-assemble-k2 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-k3 {
          0% { transform: translate(-50px, 50px) rotate(-60deg) scale(0.5); opacity: 0; }
          25% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-puzzle-assemble-k3 {
          animation: puzzle-assemble-k3 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-k4 {
          0% { transform: translate(50px, 50px) rotate(60deg) scale(0.5); opacity: 0; }
          30% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-puzzle-assemble-k4 {
          animation: puzzle-assemble-k4 3s ease-out forwards;
        }

        /* Animations untuk 3 */
        @keyframes puzzle-assemble-31 {
          0% { transform: translate(0, -60px) scale(0.6) rotateX(90deg); opacity: 0; }
          35% { transform: translate(0, 0) scale(1) rotateX(0deg); opacity: 1; }
          100% { transform: translate(0, 0) scale(1) rotateX(0deg); opacity: 1; }
        }
        .animate-puzzle-assemble-31 {
          animation: puzzle-assemble-31 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-32 {
          0% { transform: translate(0, 30px) scale(0.6) rotateY(90deg); opacity: 0; }
          40% { transform: translate(0, 0) scale(1) rotateY(0deg); opacity: 1; }
          100% { transform: translate(0, 0) scale(1) rotateY(0deg); opacity: 1; }
        }
        .animate-puzzle-assemble-32 {
          animation: puzzle-assemble-32 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-33 {
          0% { transform: translate(0, 60px) scale(0.6) rotateX(-90deg); opacity: 0; }
          45% { transform: translate(0, 0) scale(1) rotateX(0deg); opacity: 1; }
          100% { transform: translate(0, 0) scale(1) rotateX(0deg); opacity: 1; }
        }
        .animate-puzzle-assemble-33 {
          animation: puzzle-assemble-33 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-34 {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          50% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-puzzle-assemble-34 {
          animation: puzzle-assemble-34 3s ease-out forwards;
        }

        @keyframes puzzle-assemble-35 {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          55% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-puzzle-assemble-35 {
          animation: puzzle-assemble-35 3s ease-out forwards;
        }

        /* Text Animations */
        @keyframes tekno-enhanced {
          0% { letter-spacing: 30px; opacity: 0; transform: translateX(-50px); }
          40% { letter-spacing: 10px; opacity: 0.7; transform: translateX(0); }
          100% { letter-spacing: 0px; opacity: 1; transform: translateX(0); }
        }
        .animate-tekno-enhanced {
          animation: tekno-enhanced 2.5s ease-out forwards;
        }

        @keyframes klop-enhanced {
          0% { letter-spacing: 30px; opacity: 0; transform: translateX(50px); }
          50% { letter-spacing: 30px; opacity: 0; transform: translateX(50px); }
          100% { letter-spacing: 0px; opacity: 1; transform: translateX(0); }
        }
        .animate-klop-enhanced {
          animation: klop-enhanced 3s ease-out forwards;
        }

        /* Loading Animations */
        @keyframes puzzle-load-enhanced {
          0%, 100% { transform: rotate(45deg) scale(1) translateY(0); }
          25% { transform: rotate(90deg) scale(1.3) translateY(-10px); }
          50% { transform: rotate(135deg) scale(1.1) translateY(-5px); }
          75% { transform: rotate(180deg) scale(1.2) translateY(-8px); }
        }
        .animate-puzzle-load-enhanced {
          animation: puzzle-load-enhanced 2s ease-in-out infinite;
        }

        @keyframes puzzle-underline-enhanced {
          0% { transform: rotate(45deg) translateY(-20px) scale(0.5); opacity: 0; }
          50% { transform: rotate(45deg) translateY(0) scale(1.2); opacity: 1; }
          100% { transform: rotate(45deg) translateY(0) scale(1); opacity: 1; }
        }
        .animate-puzzle-underline-enhanced {
          animation: puzzle-underline-enhanced 1s ease-out forwards;
        }

        @keyframes progress-puzzle-enhanced {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-puzzle-enhanced {
          animation: progress-puzzle-enhanced 4s ease-in-out infinite;
        }

        @keyframes float-puzzle-enhanced {
          0%, 100% { transform: rotate(45deg) translateY(0px) rotateX(0deg); }
          33% { transform: rotate(45deg) translateY(-25px) rotateX(10deg); }
          66% { transform: rotate(45deg) translateY(-15px) rotateX(-5deg); }
        }
        .animate-float-puzzle-enhanced {
          animation: float-puzzle-enhanced 12s ease-in-out infinite;
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        .animate-float-particle {
          animation: float-particle 8s ease-in-out infinite;
        }

        /* New Animations */
        @keyframes bounce-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
        .animate-bounce-rotate {
          animation: bounce-rotate 2s ease-in-out infinite;
        }

        @keyframes bounce-rotate-delay {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-10deg); }
        }
        .animate-bounce-rotate-delay {
          animation: bounce-rotate-delay 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes sparkle-slow {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle-slow {
          animation: sparkle-slow 3s ease-in-out infinite;
        }

        @keyframes sparkle-slow-delay {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle-slow-delay {
          animation: sparkle-slow-delay 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes sparkle-slow-delay-2 {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle-slow-delay-2 {
          animation: sparkle-slow-delay-2 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typing {
          animation: typing 3.5s steps(40, end) infinite;
          width: 0;
          overflow: hidden;
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }

        @keyframes border-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-rotate {
          animation: border-rotate 8s linear infinite;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        @keyframes glow-blue {
          0%, 100% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { text-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-glow-blue {
          animation: glow-blue 3s ease-in-out infinite;
        }

        @keyframes glow-slate {
          0%, 100% { text-shadow: 0 0 20px rgba(100, 116, 139, 0.5); }
          50% { text-shadow: 0 0 30px rgba(100, 116, 139, 0.8), 0 0 40px rgba(100, 116, 139, 0.6); }
        }
        .animate-glow-slate {
          animation: glow-slate 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes pulse-connection {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-connection {
          animation: pulse-connection 4s ease-in-out infinite;
        }

        /* Existing animations */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @keyframes bounce-slow-delay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow-delay {
          animation: bounce-slow-delay 3s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          70% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 4s ease-out forwards;
        }

        /* Enhanced existing animations */
        .animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }
        .animate-ping-slow-delay { animation: ping-slow 3s ease-in-out infinite; animation-delay: 1s; }
        .animate-ping-slow-delay-2 { animation: ping-slow 3s ease-in-out infinite; animation-delay: 2s; }
        .animate-ping-slow-delay-3 { animation: ping-slow 3s ease-in-out infinite; animation-delay: 3s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slow-delay { animation: pulse-slow 4s ease-in-out infinite; animation-delay: 1s; }
        .animate-pulse-very-slow { animation: pulse-very-slow 10s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 2s ease-out forwards; opacity: 0; }
      `}</style>
    </>
  );
};
