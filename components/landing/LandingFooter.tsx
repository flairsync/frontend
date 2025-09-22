import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Facebook, Linkedin, Twitter } from "lucide-react";
import React from "react";

const LandingFooter = () => {
    return (
        <footer className="bg-card text-card-foreground font-sans px-8">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    {/* Logo & Social Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h2 className="text-3xl font-extrabold mb-4">FlairSync</h2>
                        <p className="text-lg font-semibold mb-3">Follow us</p>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Facebook"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-md"
                            >
                                <Facebook className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Twitter"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-md"
                            >
                                <Twitter className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="LinkedIn"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-md"
                            >
                                <Linkedin className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <nav className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-bold mb-5">Quick Links</h3>
                        <ul className="space-y-3">
                            {["Home", "About Us", "Integrations", "Features", "Pricing", "Contact Us"].map(
                                (link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </nav>

                    {/* Support */}
                    <nav className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-bold mb-5">Support</h3>
                        <ul className="space-y-3">
                            {["FAQ's", "Support Center", "Privacy Policy", "Terms"].map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Contact & Newsletter */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-bold mb-5">Contact</h3>
                        <address className="not-italic text-muted-foreground mb-8 text-center md:text-left">
                            <p>Andorra La Vella, AD500, Andorra</p>
                            <p>+376 123 456</p>
                        </address>

                        <h4 className="text-xl font-bold mb-4">Subscribe to our Newsletter</h4>
                        <form className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="h-12 border-input focus-visible:ring-0 focus-visible:border-primary"
                                aria-label="Email address"
                                required
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>

                <Separator className="my-12 border-border" />

                <div className="text-center text-muted-foreground text-sm">
                    © {new Date().getFullYear()} FlairSync. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
