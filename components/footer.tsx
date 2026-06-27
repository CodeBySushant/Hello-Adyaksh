"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#003893] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold text-[#DC143C]">W</span>
              </div>
              <div>
                <h3 className="font-semibold">Hello Mayor</h3>
                <p className="text-xs text-white/60">Portal</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("mission")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/notices"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("notices")}
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("complaints")}
                </Link>
              </li>
              <li>
                <Link
                  href="/development"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("development")}
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("reports")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t("contact")}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 text-[#DC143C]" />
                +977-9804715680
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-[#DC143C]" />
                chairperson.tkgp@gmail.com
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-[#DC143C] mt-0.5" />
                {t("footerText")}
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#DC143C] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#DC143C] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#DC143C] transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Hello Mayor Portal.{" "}
            {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-1 text-sm text-white/60">
            <span>Powered by</span>
            <span className="text-[#DC143C] font-medium">Digital Nepal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
