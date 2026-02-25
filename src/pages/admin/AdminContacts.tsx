import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Mail, Eye, Trash2, MessageSquare, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

const mockContacts: ContactMessage[] = [
  { id: "1", name: "Jean Pierre Habimana", email: "jean@gmail.com", subject: "Bulk order inquiry", message: "Hello, I'm interested in placing a bulk order for brake pads and oil filters for our fleet of 50 vehicles. Could you provide a quote?", date: "2026-02-25", read: false },
  { id: "2", name: "Marie Claire Uwimana", email: "marie@yahoo.com", subject: "Return request", message: "I received a wrong part (alternator for Ford instead of Toyota). I'd like to return and get the correct one.", date: "2026-02-24", read: false },
  { id: "3", name: "Emmanuel Nsengimana", email: "emmanuel@hotmail.com", subject: "Partnership proposal", message: "We are a car dealership in Musanze and would like to discuss a partnership for supplying parts to our service center.", date: "2026-02-23", read: true },
  { id: "4", name: "Diane Mukamana", email: "diane@gmail.com", subject: "Delivery timeline", message: "When will the LED headlight kit (order #MG-5K2L) be delivered? It's been 5 days since I ordered.", date: "2026-02-22", read: true },
  { id: "5", name: "Patrick Bizimungu", email: "patrick@outlook.com", subject: "Wholesale pricing", message: "I operate an auto parts shop in Huye. I'd like wholesale pricing for your product catalog.", date: "2026-02-20", read: true },
];

const AdminContacts = () => {
  const [contacts, setContacts] = useState(mockContacts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()));
  const unread = contacts.filter((c) => !c.read).length;

  const markRead = (id: string) => setContacts((p) => p.map((c) => c.id === id ? { ...c, read: true } : c));
  const handleDelete = (id: string) => {
    setContacts((p) => p.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.info("Message deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {unread > 0 && <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full font-semibold">{unread} unread</span>}
          </div>
          <p className="text-sm text-muted-foreground">{contacts.length} total messages</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => { setSelected(c); markRead(c.id); }}
                className={`bg-card rounded-xl p-4 border shadow-sm cursor-pointer transition-all hover:shadow-md ${selected?.id === c.id ? "border-secondary ring-1 ring-secondary/30" : "border-border"} ${!c.read ? "border-l-4 border-l-secondary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${!c.read ? "font-bold" : "font-medium"}`}>{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{c.date}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No messages found</p>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card rounded-xl border border-border shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold">{selected.subject}</h2>
                      <p className="text-sm text-muted-foreground">From: {selected.name} · {selected.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.date}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { window.location.href = `mailto:${selected.email}`; }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed text-foreground/90">{selected.message}</div>
                  <div className="mt-4">
                    <Button size="sm" onClick={() => { window.location.href = `mailto:${selected.email}?subject=Re: ${selected.subject}`; }}>
                      <Mail className="h-4 w-4 mr-1" /> Reply
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center text-muted-foreground">
                  <Eye className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Select a message to view</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
