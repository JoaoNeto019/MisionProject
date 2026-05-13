import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Heart, ArrowRight, MapPin, Copy, Check, MessageCircle, ShoppingCart, BookmarkCheck, ChevronDown, Plus, Minus, Target, Loader2, Info, Timer, Users, CloudSnow, Trophy, Plane, Briefcase, Share2, Sparkles } from "lucide-react";
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

const ITEM_PRICES_NUM: Record<string, number> = {
  "1": 910, "2": 85, "3": 85, "4": 30, "5": 190, "6": 360, "7": 45, "8": 15, "9": 250, "10": 45,
  "11a": 120, "11": 95, "12": 150, "13a": 35, "13b": 35, "13c": 35, "14": 25, 
  "15": 195, "15b": 150, "16a": 80, "16b": 120, "16c": 90, "16d": 50, "17": 35, "18": 42, "19": 200,
  "20": 40, "21": 60, "22": 70, "23": 65, "99": 5
};

const CURIOSIDADES_SALTO = [
  "Salto é a segunda maior cidade do Uruguai! 🇺🇾",
  "A cidade é famosa mundialmente por suas águas termais curativas. ♨️",
  "Luis Suárez e Edinson Cavani nasceram aqui! ⚽",
  "A Represa de Salto Grande é uma das maiores do continente.",
  "Salto é conhecida como a 'Capital do Citrus' do país. 🍊",
  "O Rio Uruguai in Salto oferece um dos pores do sol mais lindos. 🌅",
  "A arquitetura local preserva casarões históricos do século XIX.",
  "No inverno, as geadas são comuns e o frio é intenso! ❄️",
  "O Teatro Larrañaga é um ícone de luxo e cultura uruguaia.",
  "A 'Costanera' é o ponto de encontro oficial para o Mate.",
  "O nome 'Salto' vem das antigas quedas d'água do rio.",
  "A cidade fica de frente para a Argentina (Concordia).",
  "O Uruguai foi pioneiro na liberdade de culto na região.",
  "A pecuária é o motor econômico das estâncias vizinhas.",
  "A hospitalidade salteña é famosa por ser muito acolhedora.",
  "Muitos missionários amam Salto pela receptividade do povo.",
  "O Doce de Leite uruguaio é patrimônio em cada esquina! 🥛",
  "A Ponte Internacional Salto Grande une dois países.",
  "Salto tem uma forte vida universitária e jovem.",
  "O churrasco (Asado) é uma tradição sagrada aos domingos.",
  "A Catedral de San Juan Bautista é um marco da fé local.",
  "Salto abriga o maior parque aquático termal da América do Sul.",
  "O clima úmido faz a vegetação ser sempre muito verde.",
  "A cidade tem museus que contam a história da independência.",
  "O comércio local é vibrante e cheio de tradição gaúcha.",
  "Salto é o destino perfeito para quem busca paz e natureza.",
  "A cidade é um hub cultural importante do Norte uruguaio.",
  "Missionários em Salto caminham muito pelas 'calles' largas.",
  "O sotaque uruguaio aqui tem uma melodia única.",
  "Salto é um lugar onde a história e o futuro se encontram."
];

interface Item { id: string; name: string; description: string; goal: number; reserved: number; size: string; }
interface Category { title: string; items: Item[]; }

export default function App() {
  const [showInventory, setShowInventory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPixScreen, setShowPixScreen] = useState(false); 
  const [isPaid, setIsPaid] = useState(false);
  const [activeTab, setActiveTab] = useState("reserva");
  const [pixCopied, setPixCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<{ categoryIndex: number; itemId: string; } | null>(null);
  const [formData, setFormData] = useState({ name: "", mensagem: "" });
  const [showMapModal, setShowMapModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [estoqueCarregado, setEstoqueCarregado] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  const [ultimasDoacoes, setUltimasDoacoes] = useState<any[]>([]);
  const [donationIndex, setDonationIndex] = useState(0);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0 });
  const [tempSalto, setTempSalto] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showInventory, showPixScreen]);

  const [categories, setCategories] = useState<Category[]>([
    {
      title: " Traje Missionário",
      items: [
        { id: "1", name: "Terno Padrão", description: "Corte clássico para o dia a dia.", goal: 2, reserved: 0, size: "Tam: Consultar" },
        { id: "2", name: "Camisa Branca (Curta)", description: "Tecido leve e respirável.", goal: 4, reserved: 0, size: "Tam: 5" },
        { id: "3", name: "Camisa Branca (Longa)", description: "Padrão para uso formal.", goal: 5, reserved: 0, size: "Tam: 5" },
        { id: "4", name: "Gravata", description: "Padrão conservador.", goal: 3, reserved: 0, size: "Padrão" },
        { id: "5", name: "Calça Social", description: "Resistente para caminhar muito.", goal: 4, reserved: 0, size: "Tam: G" },
        { id: "6", name: "Sapato Social", description: "Solado de borracha reforçado.", goal: 2, reserved: 0, size: "Tam: 43" },
        { id: "7", name: "Cinto Social", description: "Material resistente.", goal: 2, reserved: 0, size: "Padrão" },
        { id: "8", name: "Meia Social", description: "Cano longo (preço por par).", goal: 7, reserved: 0, size: "Tam: 43" },
        { id: "9", name: "Terno Oficiante", description: "Camisa Social Branca, Calça Social Branca, Meias Brancas, Cinto Braco e Gravata Branca", goal: 1, reserved: 0, size: "Tam: Consultar" },
        { id: "10", name: "Palmilha Gel", description: "Para conforto nas caminhadas.", goal: 2, reserved: 0, size: "Tam: 43" },
      ],
    },
    {
      title: "❄️ Kit Inverno Uruguai",
      items: [
        { id: "11a", name: "Segunda Pele / Térmica", description: "Conjunto para frio extremo.", goal: 2, reserved: 2, size: "Tam: G" },
        { id: "11", name: "Casaco Leve", description: "Para o frio moderado.", goal: 3, reserved: 1, size: "Tam: GG" },
        { id: "12", name: "Casaco Pesado", description: "Estilo Anorak with forro grosso.", goal: 1, reserved: 0, size: "Tam: GG" },
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
        { id: "15b", name: "Mala de Bordo (10kg)", description: "Mala de mão.", goal: 1, reserved: 1, size: "10kg" },
        { id: "16a", name: "Roupas de Exercício", description: "Bermudas e camisetas leves.", goal: 2, reserved: 2, size: "Tam: G" },
        { id: "16b", name: "Calça Jeans/Sarja", description: "Dia de preparação/serviço pesado.", goal: 1, reserved: 1, size: "Tam: 42" },
        { id: "16c", name: "Pijamas", description: "Um de verão e um de inverno.", goal: 2, reserved: 2, size: "Tam: G" },
        { id: "16d", name: "Chinelo Havaianas", description: "Havaianas de lei.", goal: 1, reserved: 1, size: "Tam: 43" },
        { id: "17", name: "Roupa de Cama", description: "Jogo completo com lençol e fronha.", goal: 2, reserved: 0, size: "Solteiro" },
        { id: "18", name: "Toalha de Banho", description: "Tecido de alta absorção.", goal: 2, reserved: 0, size: "Padrão" },
        { id: "19", name: "Tênis Esportivo", description: "Confortável para exercício.", goal: 1, reserved: 0, size: "Tam: 43" },
      ],
    },
    {
      title: " Higiene e Saúde",
      items: [
        { id: "20", name: "Kit Banho", description: "Shampoo, desodorante, sabonete (Básico CTM).", goal: 1, reserved: 1, size: "Básico" },
        { id: "21", name: "Barbeador", description: "Aparelho de qualidade e estoque de lâminas.", goal: 1, reserved: 1, size: "Padrão" },
        { id: "22", name: "Remédios Básicos", description: "Analgésicos, antitérmicos, estômago e band-aid.", goal: 1, reserved: 0, size: "Kit" },
        { id: "23", name: "Protetor Solar", description: "Item obrigatório para o verão uruguaio.", goal: 1, reserved: 0, size: "Padrão" },
      ]
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date("2026-08-05T00:00:00").getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-31.39&longitude=-57.96&current_weather=true")
      .then(r => r.json())
      .then(data => setTempSalto(Math.round(data.current_weather.temperature)))
      .catch(() => setTempSalto(null));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCuriosityIndex((prev) => (prev + 1) % CURIOSIDADES_SALTO.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ultimasDoacoes.length > 1) {
      const cycle = setInterval(() => {
        setDonationIndex((prev) => (prev + 1) % ultimasDoacoes.length);
      }, 4000);
      return () => clearInterval(cycle);
    }
  }, [ultimasDoacoes]);

  const totalGoal = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.goal, 0), 0);
  const totalReserved = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.reserved, 0), 0);
  const overallProgress = (totalReserved / totalGoal) * 100;

  const selectedItemData = selectedItem ? categories[selectedItem.categoryIndex]?.items.find((i) => i.id === selectedItem.itemId) : null;
  const maxAvailable = selectedItemData ? selectedItemData.goal - selectedItemData.reserved : 1;

  const handleReserve = (categoryIndex: number, itemId: string) => {
    setSelectedItem({ categoryIndex, itemId });
    setQuantity(1);
    setPixData(null);
    setReservationSuccess(false);
    setActiveTab("reserva");
    setShowModal(true);
  };

  const handleRecrutarReforcos = () => {
    const msg = encodeURIComponent(`Fala pessoal! Estou apoiando a missão do Elder Barbarini no Uruguai 🇺🇾. Ele já conseguiu ${Math.round(overallProgress)}% dos suprimentos! Falta pouco, ajude você também: https://mision-project.vercel.app`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
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
      alert("Erro ao gerar PIX.");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPixScreen && pixData?.id) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.rpc('check_asaas_status', { 
            payment_id: pixData.id 
          });
          if (error) throw error;
          if (data === 'RECEIVED' || data === 'CONFIRMED') {
            clearInterval(interval);
            await supabase.from('doacoes_confirmadas').insert([{ 
                nome_pessoa: formData.name || "Doador PIX", 
                item_id: selectedItem?.itemId,
                item_nome: selectedItemData?.name,
                quantidade: quantity,
                mensagem: formData.mensagem || "Apoio enviado! 🙏"
            }]);
            setIsPaid(true);
            if (selectedItem) {
              setCategories((prev) => prev.map((category, idx) => idx === selectedItem.categoryIndex ? { ...category, items: category.items.map((item) => item.id === selectedItem.itemId ? { ...item, reserved: Math.min(item.reserved + quantity, item.goal) } : item ), } : category ));
            }
          }
        } catch (err) { console.log("Aguardando..."); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showPixScreen, pixData, selectedItem, quantity, selectedItemData, formData]);

  useEffect(() => {
    const carregarTudo = async () => {
      if (estoqueCarregado) return;
      const { data: doacoes, error } = await supabase.from('doacoes_confirmadas').select('*').order('id', { ascending: false });
      if (doacoes && !error) {
        setUltimasDoacoes(doacoes); 
        setCategories((prevCategories) => prevCategories.map((category) => ({
            ...category,
            items: category.items.map((item) => {
              const reservasBanco = doacoes.filter((d) => String(d.item_id).trim() === String(item.id).trim()).reduce((acc, curr) => acc + curr.quantidade, 0);
              return { ...item, reserved: Math.min(item.reserved + reservasBanco, item.goal) };
            })
        })));
        setEstoqueCarregado(true);
      }
    };
    carregarTudo();
  }, [estoqueCarregado]);

  const handleSendWhatsApp = () => {
    const itemName = selectedItemData?.name ?? "item";
    const total = selectedItem ? (ITEM_PRICES_NUM[selectedItem.itemId] * quantity) : 0;
    const msg = encodeURIComponent(`Olá! Fiz o PIX de R$ ${total.toFixed(2)} (${quantity}x ${itemName}) para a missão do Elder Barbarini. Segue o comprovante! 🙏`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      const { error } = await supabase.from('doacoes_confirmadas').insert([{ 
          nome_pessoa: formData.name, 
          item_id: selectedItem.itemId,
          item_nome: selectedItemData?.name,
          quantidade: quantity,
          mensagem: formData.mensagem
      }]);
      if (error) {
        alert("Erro ao conectar com o banco de dados.");
        return;
      }
      setCategories((prev) => prev.map((category, idx) => idx === selectedItem.categoryIndex ? { ...category, items: category.items.map((item) => item.id === selectedItem.itemId ? { ...item, reserved: Math.min(item.reserved + quantity, item.goal) } : item ), } : category ));
      const msg = encodeURIComponent(`📋 *Nova Reserva — Elder Barbarini*\n🛍️ *Item:* ${quantity}x ${selectedItemData?.name}\n👤 *Nome:* ${formData.name}\n💬 *Mensagem:* ${formData.mensagem}\n\nEstou ciente que devo comprar e entregar este item! ✅`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      setReservationSuccess(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        @keyframes goldShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 10% { transform: scale(1.05); opacity: 1; } 15% { transform: scale(1); } 85% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0; } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes slideCuriosity { 0% { transform: translateY(20px); opacity: 0; } 10% { transform: translateY(0); opacity: 1; } 90% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-20px); opacity: 0; } }
        @keyframes borderPulse { 0% { border-color: rgba(201, 168, 76, 0.3); } 50% { border-color: rgba(201, 168, 76, 1); } 100% { border-color: rgba(201, 168, 76, 0.3); } }
        .hero-headline { font-family: 'Playfair Display', serif; background: linear-gradient(110deg, #C9A84C, #FAEFC8, #C9A84C, #FAEFC8, #C9A84C); background-size: 250% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: goldShimmer 12s ease infinite; }
        .hero-cta { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #7A5C10 0%, #D4AF37 45%, #FAEFC8 50%, #D4AF37 55%, #9A7520 100%); background-size: 200% auto; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .hero-cta:hover { background-position: right center; transform: translateY(-3px); box-shadow: 0 15px 45px rgba(212, 175, 55, 0.4); }
        .animate-tab { animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop { animation: popIn 4s ease-in-out infinite; }
        .animate-curiosity { animation: slideCuriosity 8s ease-in-out infinite; }
        .location-pill { animation: borderPulse 3s infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-card { background: rgba(20, 20, 20, 0.4); border: 1px solid rgba(212, 175, 55, 0.15); backdrop-filter: blur(12px); box-shadow: 0 30px 60px rgba(0,0,0,0.4); }
        .critical-item { animation: pulse-red 2s infinite; border-color: rgba(239, 68, 68, 0.5) !important; }
      `}</style>

      {showPixScreen ? (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col animate-tab">
          <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-[#D4AF37]/15 p-4 md:p-6 transition-all">
             <div className="max-w-[1200px] mx-auto flex justify-between items-center">
              <div className="text-[#C9A84C] font-bold tracking-widest text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>E·B</div>
              <button onClick={() => {setShowPixScreen(false); setIsPaid(false);}} className="group flex items-center gap-2 text-[#C9A84C] text-[0.65rem] uppercase tracking-widest border border-[#C9A84C]/30 px-6 py-2.5 hover:bg-[#C9A84C]/10 rounded-sm font-semibold transition-all">
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1" /> Voltar à Lista
              </button>
            </div>
          </nav>
          
          <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-[600px] mx-auto text-center space-y-8">
            {isPaid ? (
              <div className="space-y-6 animate-tab">
                <div className="w-24 h-24 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto border-4 border-[#25D366]/30 shadow-[0_0_60px_rgba(37,211,102,0.3)]"><Check size={48} strokeWidth={3} /></div>
                <h2 className="text-4xl font-serif text-[#FAFAFA]" style={{ fontFamily: 'Playfair Display, serif' }}>Pagamento Confirmado!</h2>
                <p className="text-[#9CA3AF] text-lg">Obrigado por sua doação!</p>
                <Button onClick={handleRecrutarReforcos} className="w-full bg-[#C9A84C] hover:bg-[#FAEFC8] text-black font-bold uppercase tracking-[0.1em] h-14 mt-4 flex items-center justify-center gap-3 transition-all"><Share2 size={20} /> Recrutar Reforços</Button>
                <Button onClick={() => {setShowPixScreen(false); setIsPaid(false);}} className="w-full border border-white/10 text-white font-bold uppercase tracking-[0.2em] h-14 mt-2 transition-all">Voltar para a Lista</Button>
              </div>
            ) : (
              <>
                <header className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-serif text-[#FAFAFA]" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedItemData?.name}</h2>
                  <div className="bg-white/[0.02] border border-white/10 px-8 py-4 rounded-full inline-block shadow-inner">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[#6B7280] mb-1 font-bold">Preço estimado</p>
                    <span className="text-4xl font-bold text-[#C9A84C] tracking-tighter">R$ {(selectedItem ? ITEM_PRICES_NUM[selectedItem.itemId] * quantity : 0).toFixed(2)}</span>
                  </div>
                </header>
                <div className="bg-white p-4 rounded-3xl border-4 border-[#C9A84C]/20 shadow-[0_0_60px_rgba(201,168,76,0.15)]">
                  {pixData?.encodedImage ? <img src={`data:image/png;base64,${pixData.encodedImage}`} className="w-64 h-64 md:w-80 md:h-80 object-contain" alt="QR Code PIX" /> : <div className="w-64 h-64 flex items-center justify-center"><Loader2 className="animate-spin text-[#C9A84C]" size={40} /></div>}
                </div>
                <div className="w-full space-y-5">
                  <div className="flex items-center justify-between bg-black/50 px-5 py-4 rounded-2xl border border-white/10 shadow-inner group overflow-hidden">
                    <div className="flex-1 overflow-x-auto no-scrollbar text-left mr-4"><code className="text-[#C9A84C] text-sm tracking-tight font-mono whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">{pixData?.payload}</code></div>
                    <button onClick={() => {navigator.clipboard.writeText(pixData.payload); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000);}} className="text-[#C9A84C] p-3 bg-[#C9A84C]/10 rounded-xl hover:bg-[#C9A84C]/20 active:scale-90 transition-all flex-shrink-0">{pixCopied ? <Check size={24} /> : <Copy size={24} />}</button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4 text-[#C9A84C] opacity-70 animate-pulse">
                    <Loader2 className="animate-spin" size={14} />
                    <p className="text-[0.65rem] uppercase tracking-widest font-bold">Aguardando confirmação do banco...</p>
                  </div>
                  <Button onClick={handleSendWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-[0.8rem] tracking-[0.3em] h-16 uppercase flex items-center justify-center gap-3 rounded-xl shadow-2xl transition-all shadow-[#25D366]/20 transition-all">
                    <MessageCircle size={24} /> Já paguei! Enviar Comprovante
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      ) : !showInventory ? (
        <div className="relative min-h-screen flex flex-col animate-tab">
          <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at top, #201a0d 0%, #0a0a0a 60%)' }} />
          <nav className="relative w-full p-8 md:p-12 flex justify-between items-center max-w-[1400px] mx-auto z-50">
            <div className="text-[#C9A84C] text-xl font-bold tracking-[0.3em]" style={{ fontFamily: 'Playfair Display, serif' }}>E · B</div>
            {tempSalto !== null && (
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <CloudSnow size={16} className={tempSalto < 10 ? "text-cyan-400 animate-pulse" : "text-[#C9A84C]"} />
                <span className="text-[0.6rem] uppercase tracking-widest font-bold">Salto: {tempSalto}°C {tempSalto < 10 && "❄️"}</span>
              </div>
            )}
          </nav>
          
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto pb-20">
            <h1 className="hero-headline text-6xl sm:text-9xl font-bold mb-8 leading-tight tracking-tight drop-shadow-lg">Elder Barbarini</h1>
            
            {/* LOCALIZAÇÃO NO TOPO E CLICÁVEL */}
            <button onClick={() => setShowMapModal(true)} className="location-pill flex items-center gap-3 bg-white/5 border border-[#C9A84C]/30 px-8 py-3.5 rounded-full mb-10 hover:bg-[#C9A84C]/10 transition-all active:scale-95 group shadow-[0_0_20px_rgba(201,168,76,0.1)] transition-all">
              <MapPin size={18} className="text-[#C9A84C] group-hover:animate-bounce" strokeWidth={2} />
              <span className="text-[0.7rem] tracking-[0.5em] uppercase font-bold text-[#FAFAFA]">Missão Uruguay · Salto</span>
            </button>

            <div className="flex gap-4 mb-10 text-[#C9A84C] font-mono text-sm tracking-widest uppercase">
              <div className="flex flex-col items-center"><span className="text-2xl font-bold">{timeLeft.d}</span><span>Dias</span></div>
              <div className="flex flex-col items-center"><span className="text-2xl font-bold">{timeLeft.h}</span><span>Horas</span></div>
              <div className="flex flex-col items-center"><span className="text-2xl font-bold">{timeLeft.m}</span><span>Min</span></div>
            </div>

            {/* CURIOSIDADES EMBAIXO DO COUNTDOWN */}
            <div className="glass-card bg-black/40 px-6 py-5 rounded-2xl mb-12 border border-[#D4AF37]/10 max-w-[450px] w-full h-[110px] flex flex-col items-center justify-center overflow-hidden shadow-inner transition-all">
               <div className="flex items-center gap-2 mb-2.5 text-[#D4AF37] opacity-60">
                 <span className="text-[0.55rem] uppercase tracking-[0.4em] font-black">Fatos de Salto</span>
               </div>
               <div key={curiosityIndex} className="animate-curiosity text-[0.8rem] text-[#E5E7EB] font-light leading-snug px-2">
                  {CURIOSIDADES_SALTO[curiosityIndex]}
               </div>
            </div>

            <div className="flex flex-col items-center w-full max-w-[850px] mb-20 relative px-10">
              <button onClick={() => setShowInventory(true)} className="hero-cta text-black px-16 py-7 rounded-sm font-bold tracking-[0.25em] uppercase flex items-center gap-4 text-xs shadow-2xl transition-all mb-10">
                <Heart size={20} fill="currentColor" /> Contribuye a mi missão <ArrowRight size={20} />
              </button>

              {/* VERSÍCULO SEM CAIXA */}
              <div className="text-center space-y-2 opacity-80 animate-in fade-in duration-1000">
                <p className="italic text-xl sm:text-2xl text-[#E5E7EB] leading-relaxed font-serif px-4">
                  "Ide por todo o mundo, pregai o evangelho a toda criatura."
                </p>
                <div className="flex items-center justify-center gap-4">
                   <div className="w-6 h-px bg-[#C9A84C]/40" />
                   <p className="text-[#C9A84C] text-[0.6rem] tracking-[0.4em] uppercase font-bold">Marcos 16:15</p>
                   <div className="w-6 h-px bg-[#C9A84C]/40" />
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-[#0d0d0d] animate-tab">
           <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-[#D4AF37]/15 p-4 md:p-6 transition-all">
             <div className="max-w-[1200px] mx-auto flex justify-between items-center">
              <div className="text-[#C9A84C] font-bold tracking-widest text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>E·B</div>
              <button onClick={() => setShowInventory(false)} className="group flex items-center gap-2 text-[#C9A84C] text-[0.65rem] uppercase tracking-widest border border-[#C9A84C]/30 px-6 py-2.5 hover:bg-[#C9A84C]/10 rounded-sm font-semibold transition-all transition-all">
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1" /> Voltar
              </button>
            </div>
          </nav>
          <main className="max-w-[1200px] mx-auto p-6 sm:p-12 no-scrollbar">
            
            {ultimasDoacoes.length > 0 && (
              <div className="mb-12 h-20 flex items-center justify-center overflow-hidden">
                <div key={donationIndex} className="animate-pop bg-transparent px-8 py-3 rounded-full flex flex-col items-center gap-1 border border-[#C9A84C]/30 shadow-none">
                  <div className="flex items-center gap-4">
                    <Users size={18} className="text-[#C9A84C]" />
                    <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">🙏 {ultimasDoacoes[donationIndex]?.nome_pessoa} doou {ultimasDoacoes[donationIndex]?.item_nome}!</span>
                  </div>
                  {ultimasDoacoes[donationIndex]?.mensagem && (
                    <p className="text-[0.6rem] italic text-[#FAFAFA]/60 font-serif max-w-[250px] truncate">"{ultimasDoacoes[donationIndex].mensagem}"</p>
                  )}
                </div>
              </div>
            )}

            <header className="text-center mb-16 relative">
              <h2 className="text-4xl sm:text-7xl font-bold mb-6 inline-block relative font-serif text-[#FAFAFA]" style={{ fontFamily: 'Playfair Display, serif' }}>Lista de Suprimentos</h2>
              <div className="max-w-md mx-auto mt-14 bg-white/[0.02] border border-white/10 p-8 rounded-3xl text-center shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                 <div className="flex justify-between items-end mb-5 text-left">
                    <div><p className="text-[0.6rem] uppercase tracking-[0.25em] text-[#6B7280] mb-2 font-medium">Missão em Progresso</p><p className="text-3xl font-bold text-[#C9A84C] tracking-tight">{Math.round(overallProgress)}%</p></div><Target className="text-[#C9A84C] mb-1 opacity-60" size={32} />
                 </div>
                 <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                    <div className="h-full bg-gradient-to-r from-[#7A5C10] via-[#C9A84C] to-[#FAEFC8] transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                 </div>
                 <div className="flex justify-between mt-3 px-1 text-[0.5rem] uppercase tracking-widest text-[#6B7280] font-bold">
                    <div className="flex flex-col items-center gap-1 opacity-60"><Plane size={12} /><span>25%</span></div>
                    <div className="flex flex-col items-center gap-1"><Trophy size={12} /><span>50%</span></div>
                    <div className="flex flex-col items-center gap-1 opacity-60"><Plane size={12} className="rotate-90" /><span>Pronto!</span></div>
                 </div>
                 <p className="text-[0.7rem] text-[#888] mt-5 uppercase tracking-[0.2em] font-light"> {totalReserved} de {totalGoal} itens garantidos </p>
              </div>
            </header>

            <div className="space-y-24">
              {categories.map((category, catIdx) => (
                <section key={category.title}>
                  <div className="flex items-center gap-8 mb-12"><h3 className="text-3xl font-serif font-medium text-[#FAFAFA] whitespace-nowrap" style={{ fontFamily: 'Playfair Display, serif' }}>{category.title}</h3><div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/50 via-[#D4AF37]/10 to-transparent" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {category.items.map((item) => {
                      const isComplete = item.reserved >= item.goal;
                      const isCritical = item.id === "12" || item.id === "15";
                      const progress = (item.reserved / item.goal) * 100;
                      return (
                        <Card key={item.id} onClick={() => !isComplete && handleReserve(catIdx, item.id)} className={`bg-white/[0.03] border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-all duration-500 group ${isComplete ? 'opacity-50' : 'cursor-pointer hover:bg-white/[0.07] hover:-translate-y-2'} ${isCritical && !isComplete ? 'critical-item' : ''}`}>
                          <CardHeader className="pb-4 text-left">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <CardTitle className="text-[#FAFAFA] text-2xl leading-tight font-medium tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</CardTitle>
                                  {isCritical && !isComplete && <Badge className="bg-red-500/20 text-red-500 border-red-500/50 text-[0.6rem] animate-pulse">URGENTE</Badge>}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="outline" className="bg-[#D4AF37]/15 text-[#FAEFC8] border-[#C9A84C]/40 uppercase text-[0.65rem] font-bold px-4 py-1.5 tracking-widest shadow-sm transition-all">R$ {ITEM_PRICES_NUM[item.id]},00</Badge>
                                    <Badge variant="outline" className="bg-white/5 text-[#9CA3AF] border-white/10 uppercase text-[0.65rem] px-4 py-1.5 tracking-widest transition-all">{item.size}</Badge>
                                </div>
                              </div>
                              {!isComplete ? <div className="text-center flex-shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 min-w-[85px]"><span className="block text-[0.55rem] uppercase tracking-[0.25em] text-[#6B7280] mb-1 transition-all">Faltam</span><span className="text-3xl font-bold text-[#C9A84C] tracking-tighter transition-all">{item.goal - item.reserved}</span></div> : <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20 flex-shrink-0 shadow-lg transition-transform hover:scale-105 transition-all transition-all"><Check size={28} strokeWidth={3} /></div>}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-3 text-left">
                            <p className="text-[#9CA3AF] text-base mb-10 font-light leading-relaxed">{item.description}</p>
                            <div className="space-y-4 mb-10"><div className="flex justify-between text-[0.7rem] text-[#6B7280] tracking-[0.25em] uppercase font-bold"><span>Suprimento: {item.reserved}/{item.goal}</span><span className="text-[#D6D3D1]">{Math.round(progress)}%</span></div><div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-sm transition-all"><div className="h-full bg-gradient-to-r from-[#7A5C10] via-[#C9A84C] to-[#FAEFC8] transition-all duration-700" style={{ width: `${progress}%` }} /></div></div>
                            {!isComplete && <Button className="w-full hero-cta text-black font-bold uppercase text-[0.75rem] tracking-[0.3em] h-14 rounded-sm shadow-xl transition-all transition-all transition-all transition-all">Contribuir com este Item! <Heart size={18} className="ml-3" fill="currentColor" /></Button>}
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
        <DialogContent className="bg-[#0f0f0f] border-[#D4AF37]/40 text-white max-w-sm w-[90vw] p-5 md:p-8 rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl max-h-[94vh] overflow-y-auto no-scrollbar scroll-smooth">
          <div className="flex flex-col items-center w-full">
            <DialogHeader className="text-center items-center mb-3">
               <DialogTitle className="text-xl md:text-2xl text-[#FAFAFA] font-serif tracking-tight transition-all">
                 {reservationSuccess ? "Reserva Realizada!" : selectedItemData?.name}
               </DialogTitle>
               <div className="w-10 h-0.5 bg-[#C9A84C]/40 rounded-full mt-1" />
            </DialogHeader>

            {reservationSuccess ? (
              <div className="w-full text-center space-y-6 py-4 animate-tab">
                 <div className="w-16 h-16 bg-[#C9A84C]/20 text-[#C9A84C] rounded-full flex items-center justify-center mx-auto border-2 border-[#C9A84C]/30 shadow-lg transition-all"><Check size={32} /></div>
                 <p className="text-sm text-[#9CA3AF] font-light leading-relaxed px-4">
                   Obrigado por sua reserva! Clique abaixo para espalhar a missão e ajudar a bater as metas!
                 </p>
                 <Button onClick={handleRecrutarReforcos} className="w-full bg-[#C9A84C] hover:bg-[#FAEFC8] text-black font-bold uppercase text-[0.7rem] tracking-[0.2em] h-14 flex items-center justify-center gap-3 transition-all transition-all transition-all transition-all">
                   <Share2 size={20} /> Recrutar Reforços
                 </Button>
                 <Button onClick={() => setShowModal(false)} className="w-full border border-white/5 text-[#6B7280] text-[0.6rem] uppercase tracking-widest h-10 mt-2 transition-all transition-all">Fechar</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between w-full max-w-[280px] mt-2 mb-4 px-6 py-2 border border-white/5 rounded-full bg-white/[0.02] shadow-inner transition-all transition-all transition-all transition-all transition-all"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#C9A84C] p-2 hover:scale-110 transition-transform transition-all"><Minus size={16} /></button><span className="text-2xl md:text-3xl font-light text-[#FAFAFA] tracking-tighter transition-all">{quantity}</span><button onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))} className="text-[#C9A84C] p-2 hover:scale-110 transition-transform transition-all transition-all transition-all transition-all transition-all"><Plus size={16} /></button></div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center transition-all">
                  <TabsList className="w-full bg-white/[0.03] grid grid-cols-2 mb-6 h-11 rounded-full p-1.5 border border-white/5 shadow-md transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all"><TabsTrigger value="reserva" className="text-[0.6rem] uppercase tracking-[0.2em] rounded-full data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black font-black transition-all">Reservar</TabsTrigger><TabsTrigger value="comprar" className="text-[0.6rem] uppercase tracking-[0.2em] rounded-full data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black font-black transition-all">Comprar com pix</TabsTrigger></TabsList>
                  
                  <div className="w-full space-y-4 mt-6 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">
                    <input required value={formData.name} placeholder="SEU NOME" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-3 text-center text-sm focus:outline-none focus:border-[#C9A84C] transition-all placeholder:text-[#333] font-bold tracking-widest uppercase transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all" />
                    <textarea value={formData.mensagem} placeholder="MENSAGEM DE APOIO (OPCIONAL)" onChange={(e) => setFormData({...formData, mensagem: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C9A84C] resize-none h-16 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all" />
                  </div>

                  <TabsContent value="reserva" className="w-full animate-in fade-in zoom-in duration-300 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">
                    <div className="w-full flex flex-col items-center space-y-6 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">
                      <div className="w-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-5 rounded-2xl text-left shadow-inner mt-4 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all"><div className="flex items-center gap-2 text-[#C9A84C] mb-3 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all"><BookmarkCheck size={18} transition-all /><h4 className="font-bold text-[0.65rem] tracking-[0.2em] uppercase transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">Regra da Reserva</h4></div><p className="text-[0.8rem] text-[#D6D3D1] font-light leading-relaxed transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">Ao reservar <strong className="text-white font-bold transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">{quantity}x {selectedItemData?.name}</strong>, é de sua responsabilidade <strong className="text-[#C9A84C] transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">comprar o item fisicamente</strong> e entregá-lo em mãos.</p></div>
                      <Button onClick={handleSubmit} disabled={!formData.name} className="w-full hero-cta text-black font-bold uppercase text-[0.7rem] tracking-[0.35em] h-14 rounded-sm shadow-2xl transition-transform active:scale-95 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">Confirmar Reserva</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="comprar" className="w-full flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in duration-300 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">
                    <div className="bg-white/[0.02] w-full p-4 md:p-5 rounded-3xl border border-white/5 shadow-inner mt-4 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all"><p className="text-[0.55rem] uppercase tracking-[0.5em] text-[#6B7280] mb-1 font-bold transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">Preço estimado</p><span className="text-2xl md:text-3xl font-bold text-[#C9A84C] tracking-tighter transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">R$ {(selectedItem ? ITEM_PRICES_NUM[selectedItem.itemId] * quantity : 0).toFixed(2)}</span></div>
                    <Button onClick={handleAsaasPayment} disabled={paymentLoading || !formData.name} className="w-full hero-cta text-black font-bold uppercase text-[0.7rem] tracking-[0.35em] h-14 rounded-sm shadow-2xl transition-transform active:scale-95 transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all transition-all">{paymentLoading ? <Loader2 className="animate-spin" /> : "Gerar QR Code (PIX)"}</Button>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="bg-[#0f0f0f] border-[#D4AF37]/40 text-white max-w-lg w-[95vw] p-6 md:p-8 rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl max-h-[92vh] overflow-y-auto no-scrollbar selection:bg-[#C9A84C] selection:text-black scroll-smooth">
          <DialogHeader className="text-center items-center mb-6 transition-all transition-all transition-all"><DialogTitle className="text-3xl mb-3 text-[#FAFAFA] font-serif tracking-tight transition-all" style={{ fontFamily: 'Playfair Display, serif' }}>Mapa da Missão</DialogTitle><div className="flex items-center gap-2 text-[#D6D3D1] tracking-[0.6em] uppercase text-[0.8rem] font-light transition-all"><MapPin size={18} className="text-[#C9A84C]" strokeWidth={1.5} /> Missão Uruguay · Salto</div><div className="w-16 h-0.5 bg-[#C9A84C]/40 rounded-full mt-4 transition-all" /></DialogHeader>
          <div className="bg-white/5 rounded-3xl p-4 flex flex-col items-center gap-4 shadow-inner border border-white/5 mt-4 transition-all">
              <div className="w-full h-72 md:h-80 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#D4AF37]/10 overflow-hidden group transition-all">
                <img src="/mision.jpeg" alt="Mapa da Missão" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/C9A84C?text=Foto+Nao+Encontrada'; }} />
              </div>
             <p className="text-center text-sm md:text-base text-[#9CA3AF] font-light leading-relaxed px-4 transition-all">A Missão <span className="text-[#FAFAFA] font-medium">Uruguay · Salto</span> abrange a região noroeste do país. Coordenadas aproximadas: <span className="text-[#C9A84C] font-bold">31°23'S 57°57'W</span>.</p>
          </div>
          <DialogFooter className="mt-10 flex justify-center w-full"><button onClick={() => setShowMapModal(false)} className="hero-cta text-black px-12 py-4 rounded-full font-bold tracking-[0.25em] uppercase text-xs shadow-2xl hover:scale-105 transition-all">Fechar Mapa</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}