import {
  // Common & Work
  Briefcase,
  FileText,
  CheckCircle2,
  ListTodo,
  Layout,
  LayoutGrid,
  ClipboardList,
  Target,
  Trophy,
  Zap,
  Flame,
  Award,
  BadgeAlert,
  Search,
  Settings,
  Settings2,
  HardDrive,
  Database,
  Cpu,
  Code2,
  Terminal,
  Layers,
  Component,
  
  // Life & Health
  Heart,
  Smile,
  Brain,
  Stethoscope,
  Activity,
  Dumbbell,
  Timer,
  Clock,
  Watch,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Cloud,
  Sprout,
  Leaf,
  Flower2,
  TreePine,
  Coffee,
  Utensils,
  GlassWater,
  ChefHat,
  Apple,
  Candy,
  Pill,
  
  // Personal & Home
  Home,
  Key,
  Lock,
  Shield,
  User,
  Users,
  Backpack,
  Gift,
  ShoppingBag,
  ShoppingCart,
  Wallet,
  Coins,
  Banknote,
  CreditCard,
  Flag,
  MapPin,
  Map,
  Compass,
  Navigation,
  Anchor,
  Plane,
  Car,
  Bike,
  Bus,
  
  // Media & Creativity
  Music,
  Mic,
  Headphones,
  Camera,
  Video,
  Image,
  Palette,
  Brush,
  PenTool,
  Pencil,
  Book,
  BookOpen,
  Library,
  GraduationCap,
  Microscope,
  Star,
  Sparkles,
  Megaphone,
  Mail,
  MessageSquare,
  Phone,
  Radio,
  Gamepad2,
  Tv,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ALL_ICONS: Record<string, LucideIcon> = {
  // Work
  Briefcase, FileText, CheckCircle2, ListTodo, Layout, LayoutGrid, ClipboardList, 
  Target, Trophy, Zap, Flame, Award, BadgeAlert, Search, Settings, Settings2,
  HardDrive, Database, Cpu, Code2, Terminal, Layers, Component,

  // Health & Nature
  Heart, Smile, Brain, Stethoscope, Activity, Dumbbell, Timer, Clock, Watch,
  Moon, Sun, Sunrise, Sunset, Cloud, Sprout, Leaf, Flower2, TreePine,

  // Food
  Coffee, Utensils, GlassWater, ChefHat, Apple, Candy, Pill,

  // Travel & Money
  Home, Key, Lock, Shield, User, Users, Backpack, Gift, ShoppingBag, ShoppingCart,
  Wallet, Coins, Banknote, CreditCard, Flag, MapPin, Map, Compass, Navigation,
  Anchor, Plane, Car, Bike, Bus,

  // Creativity & Media
  Music, Mic, Headphones, Camera, Video, Image, Palette, Brush, PenTool, Pencil,
  Book, BookOpen, Library, GraduationCap, Microscope, Star, Sparkles, Megaphone,
  Mail, MessageSquare, Phone, Radio, Gamepad2, Tv
};

export const SPHERE_ICONS = ALL_ICONS; // Keep alias for compatibility
export const SPHERE_ICON_NAMES = Object.keys(ALL_ICONS);
