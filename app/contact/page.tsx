"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  User,
  MessageSquare,
  FileText,
  Stethoscope,
  Shield,
  Flame,
} from "lucide-react";

const emergencyContacts = [
  { icon: Stethoscope, label: "Hospital", labelNe: "अस्पताल", number: "102" },
  { icon: Shield, label: "Police", labelNe: "प्रहरी", number: "100" },
  { icon: Flame, label: "Fire Brigade", labelNe: "दमकल", number: "101" },
];

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccess(true);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setShowSuccess(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: language === "en" ? "Phone" : "फोन",
      value: "+977-1-1234567",
      subValue: "+977-9841234567",
    },
    {
      icon: Mail,
      label: language === "en" ? "Email" : "इमेल",
      value: "ward@municipality.gov.np",
      subValue: "info@wardoffice.np",
    },
    {
      icon: MapPin,
      label: language === "en" ? "Address" : "ठेगाना",
      value:
        language === "en"
          ? "Ward Office, Main Street"
          : "वडा कार्यालय, मुख्य सडक",
      subValue: language === "en" ? "Municipality, Nepal" : "नगरपालिका, नेपाल",
    },
    {
      icon: Clock,
      label: language === "en" ? "Office Hours" : "कार्यालय समय",
      value:
        language === "en"
          ? "Sun - Fri: 10:00 AM - 5:00 PM"
          : "आइत - शुक्र: १०:०० - ५:००",
      subValue: language === "en" ? "Saturday: Closed" : "शनिबार: बन्द",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gradient-nepal mb-4">
              {language === "en" ? "Contact Us" : "सम्पर्क गर्नुहोस्"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en"
                ? "Get in touch with the Ward Office. We're here to help and answer any questions you may have."
                : "वडा कार्यालयसँग सम्पर्कमा रहनुहोस्। हामी तपाईंलाई मद्दत गर्न र तपाईंका प्रश्नहरूको जवाफ दिन यहाँ छौं।"}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#DC143C]" />
                {language === "en" ? "Send us a Message" : "सन्देश पठाउनुहोस्"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("fullName")} *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={
                        language === "en"
                          ? "Your full name"
                          : "तपाईंको पूरा नाम"
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("phone")} *
                    </Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="98XXXXXXXX"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="subject"
                    className="flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("subject")} *
                  </Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder={
                      language === "en"
                        ? "Subject of your message"
                        : "सन्देशको विषय"
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="message">{t("message")} *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={
                      language === "en"
                        ? "Write your message here..."
                        : "यहाँ आफ्नो सन्देश लेख्नुहोस्..."
                    }
                    className="mt-1.5"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full gradient-nepal py-6"
                >
                  {isSubmitting ? (
                    t("submitting")
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t("submit")}
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-2xl p-5"
                  >
                    <div className="h-10 w-10 rounded-xl gradient-nepal flex items-center justify-center text-white mb-3">
                      <info.icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {info.label}
                    </p>
                    <p className="text-sm font-medium">{info.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {info.subValue}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Emergency Contacts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 text-[#DC143C]">
                  {language === "en"
                    ? "Emergency Contacts"
                    : "आपतकालीन सम्पर्क"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 rounded-xl bg-red-50 cursor-pointer"
                    >
                      <contact.icon className="h-8 w-8 mx-auto text-[#DC143C] mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {language === "en" ? contact.label : contact.labelNe}
                      </p>
                      <p className="text-lg font-bold text-[#DC143C]">
                        {contact.number}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl overflow-hidden h-64 relative"
              >
                <img
                  src="/map.png"
                  alt="Ward Office Location"
                  className="w-full h-full object-cover"
                />
                {/* Overlay with location label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white" />
                    <p className="text-sm font-medium text-white">
                      {language === "en"
                        ? "Ward Office Location"
                        : "वडा कार्यालयको स्थान"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>
              {language === "en" ? "Message Sent!" : "सन्देश पठाइयो!"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {language === "en"
                ? "Thank you for contacting us. We will get back to you soon."
                : "सम्पर्क गर्नुभएकोमा धन्यवाद। हामी छिट्टै तपाईंलाई जवाफ दिनेछौं।"}
            </p>
            <Button
              onClick={resetForm}
              className="w-full rounded-full gradient-nepal"
            >
              {language === "en"
                ? "Send Another Message"
                : "अर्को सन्देश पठाउनुहोस्"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
