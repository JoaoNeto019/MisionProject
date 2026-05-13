import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Heart, ArrowRight, MapPin, Copy, Check, MessageCircle, ShoppingCart, BookmarkCheck, ChevronDown, Plus, Minus, Target, Loader2, Info } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";

// ─── CONFIGURAÇÕES SUPABASE ──────────────────────────────────────────────────
const SUPABASE_URL = "https://tjctrkbdvpuknabkcqzz.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqY3Rya2JkdnB1a25hYmtjcXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjYxMzAsImV4cCI6MjA5NDEwMjEzMH0.sOwa-EqusgChAuA_rm2h5qnta7zEexk3P3qs5CzlABk";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PIX_KEY = "joao.barbarini019@gmail.com";
const WHATSAPP_NUMBER = "5524998724533";

// TABELA DE PREÇOS (Com as suas atualizações manuais + os itens novos)
const ITEM_PRICES_NUM: Record<string, number> = {
  "1": 910, "2": 85, "3": 85, "4": 30, "5": 190, "6": 360, "7": 45, "8": 15, "9": 250, "10": 45,
  "11a": 120, "11": 95, "12": 150, "13a": 35, "13b": 35, "13c": 35, "14": 25, 
  "15": 195, "15b": 150, "16a": 80, "16b": 120, "16c": 90, "16d": 50, "17": 35, "18": 42, "19": 200,
  "20": 40, "21": 60, "22": 70, "23": 65
};

interface Item { id: string; name: string; description: string; goal: number; reserved: number; size: string; }
interface Category { title: string; items: Item[]; }

export default function App() {
  const [showInventory, setShowInventory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPixScreen, setShowPixScreen] = useState(false); 
  const [activeTab, setActiveTab] = useState("reserva");
  const [pixCopied, setPixCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<{ categoryIndex: number; itemId: string; } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  // LISTA DE ITENS COMPLETA (Com as suas categorias + os itens faltantes)
  const [categories, setCategories] = useState<Category[]>([
    {
      title: " Traje Missionário",
      items: [
        { id: "1", name: "Terno Padrão", description: "Corte clássico para o dia a dia.", goal: 2, reserved: 1, size: "Tam: Consultar" }, // Hana Carolina
        { id: "2", name: "Camisa Branca (Curta)", description: "Tecido leve e respirável.", goal: 4, reserved: 0, size: "Tam: 5" },
        { id: "3", name: "Camisa Branca (Longa)", description: "Padrão para uso formal.", goal: 5, reserved: 0, size: "Tam: 5" },
        { id: "4", name: "Gravata", description: "Padrão conservador.", goal: 3, reserved: 0, size: "Padrão" },
        { id: "5", name: "Calça Social", description: "Resistente para caminhar muito.", goal: 4, reserved: 0, size: "Tam: G" },
        { id: "6", name: "Sapato Social", description: "Solado de borracha reforçado.", goal: 2, reserved: 0, size: "Tam: 43" },
        { id: "7", name: "Cinto Social", description: "Material resistente.", goal: 2, reserved: 0, size: "Padrão" },
        { id: "8", name: "Meia Social", description: "Cano longo (preço por par).", goal: 7, reserved: 0, size: "Tam: 43" },
        { id: "9", name: "Terno Oficiante", description: "Camisa Social Branca, Calça Social Branca, Meias Brancas, Cinto Braco e Gravata Branca", goal: 1, reserved: 0, size: "Tam: Consultar" },
        { id: "10", name: "Palmilha Gel", description: "Para conforto nas caminhadas.", goal: 2, reserved: 2, size: "Tam: 43" }, // Já comprado
      ],
    },
    {
      title: "❄️ Kit Inverno Uruguai",
      items: [
        { id: "11a", name: "Segunda Pele / Térmica", description: "Conjunto para frio extremo.", goal: 2, reserved: 2, size: "Tam: G" }, // Já comprado
        { id: "11", name: "Casaco Leve", description: "Para o frio moderado.", goal: 3, reserved: 1, size: "Tam: GG" },
        { id: "12", name: "Casaco Pesado", description: "Estilo Anorak com forro grosso.", goal: 1, reserved: 0, size: "Tam: GG" },
        { id: "13a", name: "Luvas", description: "Proteção corta-vento.", goal: 1, reserved: 0, size: "Único" },
        { id: "13b", name: "Cachecol", description: "Conforto para o pescoço.", goal: 1, reserved: 0, size: "Único" },
        { id: "13c", name: "Gorro", description: "Proteção térmica.", goal: 1, reserved: 0, size: "Único" },
        { id: "14", name: "Meias Grossas", description: "Para os dias de geada.", goal: 3, reserved: 0, size: "Tam: 43" },
      ],
    },
    {
      title: " Informal e Casa",
      items: [
        { id: "15", name: "Mala de Viagem (23kg)", description: "Material resistente para a viagem.", goal: 2, reserved: 1, size: "23kg" },
        { id: "15b", name: "Mala de Bordo (10kg)", description: "Mala de mão.", goal: 1, reserved: 1, size: "10kg" }, // Já comprado
        { id: "16a", name: "Roupas de Exercício", description: "Bermudas e camisetas leves.", goal: 2, reserved: 2, size: "Tam: G" }, // Já comprado
        { id: "16b", name: "Calça Jeans/Sarja", description: "Dia de preparação/serviço pesado.", goal: 1, reserved: 1, size: "Tam: 42" }, // Já comprado
        { id: "16c", name: "Pijamas", description: "Um de verão e um de inverno.", goal: 2, reserved: 2, size: "Tam: G" }, // Já comprado
        { id: "16d", name: "Chinelo Havaianas", description: "Havaianas de lei.", goal: 1, reserved: 1, size: "Tam: 43" }, // Já comprado
        { id: "17", name: "Roupa de Cama", description: "Jogo completo com lençol e fronha.", goal: 2, reserved: 1, size: "Solteiro" },
        { id: "18", name: "Toalha de Banho", description: "Tecido de alta absorção.", goal: 2, reserved: 0, size: "Padrão" },
        { id: "19", name: "Tênis Esportivo", description: "Confortável para exercício.", goal: 1, reserved: 0, size: "Tam: 43" },
      ],
    },
    {
      title: " Higiene e Saúde",
      items: [
        { id: "20", name: "Kit Banho", description: "Shampoo, desodorante, sabonete (Básico CTM).", goal: 1, reserved: 1, size: "Básico" }, // Já comprado
        { id: "21", name: "Barbeador", description: "Aparelho de qualidade e estoque de lâminas.", goal: 1, reserved: 1, size: "Padrão" }, // Já comprado
        { id: "22", name: "Remédios Básicos", description: "Analgésicos, antitérmicos, estômago e band-aid.", goal: 1, reserved: 0, size: "Kit" },
        { id: "23", name: "Protetor Solar", description: "Item obrigatório para o verão uruguaio.", goal: 1, reserved: 0, size: "Padrão" },
      ]
    }
  ]);

  const totalGoal = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.goal, 0), 0);
  const totalReserved = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.reserved, 0), 0);
  const overallProgress = (totalReserved / totalGoal) * 100;

  const selectedItemData = selectedItem ? categories[selectedItem.categoryIndex]?.items.find((i) => i.id === selectedItem.itemId) : null;
  const maxAvailable = selectedItemData ? selectedItemData.goal - selectedItemData.reserved : 1;

  const handleReserve = (categoryIndex: number, itemId: string) => {
    setSelectedItem({ categoryIndex, itemId });
    setQuantity(1);
    setPixData(null);
    setActiveTab("reserva");
    setShowModal(true);
  };

  const handleAsaasPayment = async () => {
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_asaas_pix', {
        item_id: selectedItem?.itemId, 
        qty: quantity, 
        price: ITEM_PRICES_NUM[selectedItem?.itemId || ""], 
        item_name: selectedItemData?.name
      });
      if (error) throw error;
      setPixData(data);
      setShowModal(false); 
      setShowPixScreen(true); 
    } catch (err) {
      alert("Erro ao gerar PIX. Verifique a função SQL.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendWhatsApp = () => {
    const itemName = selectedItemData?.name ?? "item";
    const total = selectedItem ? (ITEM_PRICES_NUM[selectedItem.itemId] * quantity) : 0;
    const msg = encodeURIComponent(`Olá! Fiz o PIX de R$ ${total.toFixed(2)} (${quantity}x ${itemName}) para a missão do Elder Barbarini. Segue o comprovante! 🙏`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setCategories((prev) => prev.map((category, idx) => idx === selectedItem.categoryIndex ? { ...category, items: category.items.map((item) => item.id === selectedItem.itemId ? { ...item, reserved: Math.min(item.reserved + quantity, item.goal) } : item ), } : category ));
      const msg = encodeURIComponent(`📋 *Nova Reserva — Elder Barbarini*\n🛍️ *Item:* ${quantity}x ${selectedItemData?.name}\n👤 *Nome:* ${formData.name}\n\nEstou ciente que devo comprar e entregar este item! ✅`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      setShowModal(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        @keyframes goldShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .hero-headline { font-family: 'Playfair Display', serif; background: linear-gradient(110deg, #C9A84C, #FAEFC8, #C9A84C, #FAEFC8, #C9A84C); background-size: 250% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: goldShimmer 12s ease infinite; }
        .hero-cta { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #7A5C10 0%, #D4AF37 45%, #FAEFC8 50%, #D4AF37 55%, #9A7520 100%); background-size: 200% auto; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .hero-cta:hover { background-position: right center; transform: translateY(-3px); box-shadow: 0 15px 45px rgba(212, 175, 55, 0.4); }
        .animate-tab { animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-card { background: rgba(20, 20, 20, 0.4); border: 1px solid rgba(212, 175, 55, 0.15); backdrop-filter: blur(12px); box-shadow: 0 30px 60px rgba(0,0,0,0.4); }
      `}</style>

      {/* TELA CHEIA DO PIX */}
      {showPixScreen ? (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col animate-tab">
          <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-[#D4AF37]/15 p-4 md:p-6">
             <div className="max-w-[1200px] mx-auto flex justify-between items-center">
              <div className="text-[#C9A84C] font-bold tracking-widest text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>E·B</div>
              <button onClick={() => setShowPixScreen(false)} className="group flex items-center gap-2 text-[#C9A84C] text-[0.65rem] uppercase tracking-widest border border-[#C9A84C]/30 px-6 py-2.5 hover:bg-[#C9A84C]/10 transition-all rounded-sm font-semibold">
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar à Lista
              </button>
            </div>
          </nav>
          
          <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-[600px] mx-auto text-center space-y-8">
            <header className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif text-[#FAFAFA]" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedItemData?.name}</h2>
              <div className="bg-white/[0.02] border border-white/10 px-8 py-4 rounded-full inline-block shadow-inner">
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[#6B7280] mb-1 font-bold">Preço estimado</p>
                <span className="text-4xl font-bold text-[#C9A84C] tracking-tighter">R$ {(selectedItem ? ITEM_PRICES_NUM[selectedItem.itemId] * quantity : 0).toFixed(2)}</span>
              </div>
            </header>

            <div className="bg-white p-4 rounded-3xl border-4 border-[#C9A84C]/20 shadow-[0_0_60px_rgba(201,168,76,0.15)]">
              {pixData?.encodedImage && (
                <img src={`data:image/png;base64,${pixData.encodedImage}`} className="w-64 h-64 md:w-80 md:h-80 object-contain" alt="QR Code PIX" />
              )}
            </div>

            <div className="w-full space-y-5">
              <div className="flex items-center justify-between bg-black/50 px-5 py-4 rounded-2xl border border-white/10 shadow-inner group overflow-hidden">
                <div className="flex-1 overflow-x-auto no-scrollbar text-left mr-4">
                  <code className="text-[#C9A84C] text-sm tracking-tight font-mono whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                    {pixData?.payload}
                  </code>
                </div>
                <button onClick={() => {navigator.clipboard.writeText(pixData.payload); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000);}} className="text-[#C9A84C] p-3 bg-[#C9A84C]/10 rounded-xl hover:bg-[#C9A84C]/20 active:scale-90 transition-all flex-shrink-0">
                  {pixCopied ? <Check size={24} /> : <Copy size={24} />}
                </button>
              </div>

              <Button onClick={handleSendWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-[0.8rem] tracking-[0.3em] h-16 uppercase flex items-center justify-center gap-3 rounded-xl shadow-2xl transition-all">
                <MessageCircle size={24} /> Já paguei! Enviar Comprovante
              </Button>
            </div>
          </main>
        </div>
      ) : !showInventory ? (
        /* TELA HERO INICIAL (ENFEITADA E COM SEUS TEXTOS) */
        <div className="relative min-h-screen flex flex-col animate-tab">
          <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at top, #201a0d 0%, #0a0a0a 60%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[#C9A84C]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <nav className="relative w-full p-8 md:p-12 flex justify-between items-center max-w-[1400px] mx-auto z-50">
            <div className="text-[#C9A84C] text-xl font-bold tracking-[0.3em]" style={{ fontFamily: 'Playfair Display, serif' }}>E · B</div>
            <div className="flex items-center gap-3">
               <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse shadow-[0_0_8px_#C9A84C]" />
               <div className="text-[#6B7280] text-[0.6rem] tracking-[0.45em] uppercase font-medium">Brasil · RJ</div>
            </div>
          </nav>
          
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto pb-20">
            <h1 className="hero-headline text-6xl sm:text-9xl font-bold mb-6 leading-tight tracking-tight drop-shadow-lg">Elder Barbarini</h1>
            <button onClick={() => setShowMapModal(true)} className="flex items-center justify-center gap-2 text-[#D6D3D1] tracking-[0.6em] uppercase text-[0.7rem] mb-16 font-light hover:text-white transition-colors group">
               <MapPin size={16} className="text-[#C9A84C] group-hover:scale-110 transition-transform" strokeWidth={1.5} /> Missão Uruguay · Salto - 05 de Agosto
            </button>
            
            {/* VERSÍCULO EM GLASSMORPHISM */}
            <div className="glass-card max-w-[850px] mb-20 relative px-10 py-12 md:py-16 rounded-[2.5rem] w-full" style={{ animation: 'float 6s ease-in-out infinite' }}>
              <span className="absolute -top-12 left-8 md:left-12 text-9xl text-[#C9A84C]/15 font-serif select-none pointer-events-none">“</span>
              <p className="italic text-2xl sm:text-4xl text-[#E5E7EB] leading-relaxed font-serif px-4 md:px-8 drop-shadow-md">
                "Ide por todo o mundo, pregai o evangelho a toda criatura."
              </p>
              <div className="flex items-center justify-center gap-4 mt-10 opacity-80">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <p className="text-[#C9A84C] text-[0.65rem] tracking-[0.5em] uppercase font-bold">Marcos 16:15</p>
                <div className="w-8 h-px bg-[#C9A84C]" />
              </div>
            </div>

            <button onClick={() => setShowInventory(true)} className="hero-cta text-black px-16 py-7 rounded-sm font-bold tracking-[0.25em] uppercase flex items-center gap-4 text-xs shadow-[0_10px_40px_rgba(201,168,76,0.3)]">
              <Heart size={20} fill="currentColor" /> contribuye a mi misión <ArrowRight size={20} />
            </button>
          </main>
        </div>
      ) : (
        /* LISTA DE ITENS */
        <div className="min-h-screen bg-[#0d0d0d] animate-tab">
          <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-[#D4AF37]/15 p-4 md:p-6">
             <div className="max-w-[1200px] mx-auto flex justify-between items-center">
              <div className="text-[#C9A84C] font-bold tracking-widest text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>E·B</div>
              <button onClick={() => setShowInventory(false)} className="group flex items-center gap-2 text-[#C9A84C] text-[0.65rem] uppercase tracking-widest border border-[#C9A84C]/30 px-6 py-2.5 hover:bg-[#C9A84C]/10 transition-all rounded-sm font-semibold">
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar
              </button>
            </div>
          </nav>
          <main className="max-w-[1200px] mx-auto p-6 sm:p-12 no-scrollbar">
            <header className="text-center mb-16 relative">
              <h2 className="text-4xl sm:text-7xl font-bold mb-6 inline-block relative font-serif text-[#FAFAFA]" style={{ fontFamily: 'Playfair Display, serif' }}>Lista de Suprimentos</h2>
              <div className="max-w-md mx-auto mt-14 bg-white/[0.02] border border-white/10 p-8 rounded-3xl text-center shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                 <div className="flex justify-between items-end mb-5 text-left">
                    <div><p className="text-[0.6rem] uppercase tracking-[0.25em] text-[#6B7280] mb-2 font-medium">Missão em Progresso</p><p className="text-3xl font-bold text-[#C9A84C] tracking-tight">{Math.round(overallProgress)}%</p></div>
                    <Target className="text-[#C9A84C] mb-1 opacity-60" size={32} />
                 </div>
                 <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#7A5C10] via-[#C9A84C] to-[#FAEFC8] transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                 </div>
                 <p className="text-[0.7rem] text-[#888] mt-5 uppercase tracking-[0.2em] font-light"> {totalReserved} de {totalGoal} itens garantidos </p>
              </div>
            </header>
            <div className="space-y-24">
              {categories.map((category, catIdx) => (
                <section key={category.title}>
                  <div className="flex items-center gap-8 mb-12">
                    <h3 className="text-3xl font-serif font-medium text-[#FAFAFA] whitespace-nowrap" style={{ fontFamily: 'Playfair Display, serif' }}>{category.title}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/50 via-[#D4AF37]/10 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {category.items.map((item) => {
                      const isComplete = item.reserved >= item.goal;
                      const progress = (item.reserved / item.goal) * 100;
                      return (
                        <Card key={item.id} onClick={() => !isComplete && handleReserve(catIdx, item.id)} className={`bg-white/[0.03] border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-all duration-500 group ${isComplete ? 'opacity-50' : 'cursor-pointer hover:bg-white/[0.07] hover:-translate-y-2'}`}>
                          <CardHeader className="pb-4 text-left">
                             <div className="flex justify-between items-start gap-4">
                              <div className="space-y-4">
                                <CardTitle className="text-[#FAFAFA] text-2xl leading-tight font-medium tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</CardTitle>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="outline" className="bg-[#D4AF37]/15 text-[#FAEFC8] border-[#C9A84C]/40 uppercase text-[0.65rem] font-bold px-4 py-1.5 tracking-widest shadow-sm">R$ {ITEM_PRICES_NUM[item.id]},00</Badge>
                                    <Badge variant="outline" className="bg-white/5 text-[#9CA3AF] border-white/10 uppercase text-[0.65rem] px-4 py-1.5 tracking-widest">{item.size}</Badge>
                                </div>
                              </div>
                              {!isComplete ? (
                                <div className="text-center flex-shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 min-w-[85px]">
                                  <span className="block text-[0.55rem] uppercase tracking-[0.25em] text-[#6B7280] mb-1">Faltam</span>
                                  <span className="text-3xl font-bold text-[#C9A84C] tracking-tighter">{item.goal - item.reserved}</span>
                                </div>
                              ) : (
                                <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20 flex-shrink-0 shadow-lg"><Check size={28} strokeWidth={3} /></div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-3 text-left">
                            <p className="text-[#9CA3AF] text-base mb-10 font-light leading-relaxed">{item.description}</p>
                            <div className="space-y-4 mb-10">
                              <div className="flex justify-between text-[0.7rem] text-[#6B7280] tracking-[0.25em] uppercase font-bold">
                                <span>Suprimento: {item.reserved}/{item.goal}</span>
                                <span className="text-[#D6D3D1]">{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-sm">
                                 <div className="h-full bg-gradient-to-r from-[#7A5C10] via-[#C9A84C] to-[#FAEFC8] transition-all duration-700" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                            {!isComplete && (
                              <Button className="w-full hero-cta text-black font-bold uppercase text-[0.75rem] tracking-[0.3em] h-14 rounded-sm shadow-xl hover:scale-[1.01]">Contribuir com este Item! <Heart size={18} className="ml-3" fill="currentColor" /></Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* MODAL DE RESERVA / GERAR PIX */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#0f0f0f] border-[#D4AF37]/40 text-white max-w-sm w-[90vw] p-5 md:p-8 rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl max-h-[94vh] overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center w-full">
            <DialogHeader className="text-center items-center mb-3">
              <DialogTitle className="text-xl md:text-2xl text-[#FAFAFA] font-serif tracking-tight">{selectedItemData?.name}</DialogTitle>
              <div className="w-10 h-0.5 bg-[#C9A84C]/40 rounded-full mt-1" />
            </DialogHeader>

            <div className="flex items-center justify-between w-full max-w-[280px] mt-2 mb-4 px-6 py-2 border border-white/5 rounded-full bg-white/[0.02] shadow-inner">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#C9A84C] p-2 hover:scale-110 transition-transform"><Minus size={16} /></button>
              <span className="text-2xl md:text-3xl font-light text-[#FAFAFA] tracking-tighter">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))} className="text-[#C9A84C] p-2 hover:scale-110 transition-transform"><Plus size={16} /></button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
              <TabsList className="w-full bg-white/[0.03] grid grid-cols-2 mb-6 h-11 rounded-full p-1.5 border border-white/5 shadow-md">
                <TabsTrigger value="reserva" className="text-[0.6rem] uppercase tracking-[0.2em] rounded-full data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black font-black">Reservar</TabsTrigger>
                <TabsTrigger value="comprar" className="text-[0.6rem] uppercase tracking-[0.2em] rounded-full data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black font-black">Comprar com pix</TabsTrigger>
              </TabsList>
              
              {/* ABA DE RESERVA (COM RESUMO CLARO E OBRIGATORIEDADE) */}
              <TabsContent value="reserva" className="w-full animate-in fade-in zoom-in duration-300">
                <div className="w-full flex flex-col items-center space-y-6">
                  
                  {/* CAIXA DE AVISO / RESUMO DA RESERVA */}
                  <div className="w-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-5 rounded-2xl text-left shadow-inner">
                    <div className="flex items-center gap-2 text-[#C9A84C] mb-3">
                      <BookmarkCheck size={18} />
                      <h4 className="font-bold text-[0.65rem] tracking-[0.2em] uppercase">Regra da Reserva</h4>
                    </div>
                    <p className="text-[0.8rem] text-[#D6D3D1] font-light leading-relaxed">
                      Ao reservar <strong className="text-white font-bold">{quantity}x {selectedItemData?.name}</strong>, é de sua responsabilidade <strong className="text-[#C9A84C]">comprar o item fisicamente</strong> e entregá-lo em mãos antes da viagem.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <input required value={formData.name} placeholder="SEU NOME" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-3 text-center text-sm focus:outline-none focus:border-[#C9A84C] transition-all placeholder:text-[#333] font-bold tracking-widest" />
                    <Button type="submit" className="w-full hero-cta text-black font-bold uppercase text-[0.7rem] tracking-[0.35em] h-14 rounded-sm shadow-2xl">Confirmar Reserva</Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="comprar" className="w-full flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-white/[0.02] w-full p-4 md:p-5 rounded-3xl border border-white/5 shadow-inner">
                  <p className="text-[0.55rem] uppercase tracking-[0.5em] text-[#6B7280] mb-1 font-bold">Preço estimado</p>
                  <span className="text-2xl md:text-3xl font-bold text-[#C9A84C] tracking-tighter">R$ {(selectedItem ? ITEM_PRICES_NUM[selectedItem.itemId] * quantity : 0).toFixed(2)}</span>
                </div>

                <Button onClick={handleAsaasPayment} disabled={paymentLoading} className="w-full hero-cta text-black font-bold uppercase text-[0.7rem] tracking-[0.35em] h-14 rounded-sm shadow-2xl">
                  {paymentLoading ? <Loader2 className="animate-spin" /> : "Gerar QR Code (PIX)"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* MODAL DO MAPA DA MISSÃO COM A IMAGEM MISION.JPEG */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="bg-[#0f0f0f] border-[#D4AF37]/40 text-white max-w-lg w-[95vw] p-6 md:p-8 rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl max-h-[92vh] overflow-y-auto no-scrollbar selection:bg-[#C9A84C] selection:text-black">
          <DialogHeader className="text-center items-center mb-6">
            <DialogTitle className="text-3xl mb-3 text-[#FAFAFA] font-serif tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Mapa da Missão</DialogTitle>
            <div className="flex items-center gap-2 text-[#D6D3D1] tracking-[0.6em] uppercase text-[0.8rem] font-light">
               <MapPin size={18} className="text-[#C9A84C]" strokeWidth={1.5} /> Missão Uruguay · Salto
            </div>
            <div className="w-16 h-0.5 bg-[#C9A84C]/40 rounded-full mt-4" />
          </DialogHeader>
          
          <div className="bg-white/5 rounded-3xl p-4 flex flex-col items-center gap-4 shadow-inner border border-white/5 mt-4">
             {/* CAIXA COM A IMAGEM DO MAPA MISION.JPEG */}
             <div className="w-full h-72 md:h-80 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#D4AF37]/10 overflow-hidden group">
               <img 
                  src="/mision.jpeg" 
                  alt="Mapa da Missão" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/C9A84C?text=Foto+Nao+Encontrada'; }}
               />
             </div>
             
             <p className="text-center text-sm md:text-base text-[#9CA3AF] font-light leading-relaxed px-4">
                A Missão <span className="text-[#FAFAFA] font-medium">Uruguay · Salto</span> abrange a região noroeste do país. Coordenadas aproximadas: <span className="text-[#C9A84C] font-bold">31°23'S 57°57'W</span>.
             </p>
          </div>
          
          <DialogFooter className="mt-10 flex justify-center w-full">
             <button onClick={() => setShowMapModal(false)} className="hero-cta text-black px-12 py-4 rounded-full font-bold tracking-[0.25em] uppercase text-xs shadow-2xl hover:scale-105">Fechar Mapa</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}