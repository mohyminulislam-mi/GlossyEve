import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>);

}