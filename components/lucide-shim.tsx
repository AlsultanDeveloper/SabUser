// lucide-shim.tsx - dummy content
import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";

type Props = { size?: number; color?: string } & Record<string, any>;

const makeFeather = (name: React.ComponentProps<typeof Feather>["name"]) => {
  const Component = (props: Props) => {
    const { size = 20, color = "#111827", ...rest } = props;
    return <Feather name={name} size={size} color={color} {...rest} />;
  };
  Component.displayName = `Feather(${name})`;
  return Component;
};

const makeIon = (name: React.ComponentProps<typeof Ionicons>["name"]) => {
  const Component = (props: Props) => {
    const { size = 20, color = "#111827", ...rest } = props;
    return <Ionicons name={name} size={size} color={color} {...rest} />;
  };
  Component.displayName = `Ionicons(${name})`;
  return Component;
};

export const Mail = makeFeather("mail");
export const Eye = makeFeather("eye");
export const EyeOff = makeFeather("eye-off");
export const ArrowLeft = makeFeather("arrow-left");
export const Phone = makeFeather("phone");
export const Lock = makeFeather("lock");
export const ChevronDown = makeFeather("chevron-down");
export const Facebook = makeIon("logo-facebook");

export const User = makeFeather("user");
export const MapPin = makeFeather("map-pin");
export const CreditCard = makeFeather("credit-card");
export const Globe = makeFeather("globe");
export const DollarSign = makeFeather("dollar-sign");
export const HelpCircle = makeFeather("help-circle");
export const FileText = makeFeather("file-text");
export const Shield = makeFeather("shield");
export const MessageCircle = makeFeather("message-circle");
export const Info = makeFeather("info");
export const Trash2 = makeFeather("trash-2");
export const LogOut = makeFeather("log-out");
export const ChevronRight = makeFeather("chevron-right");
export const Edit2 = makeFeather("edit-2");
export const Plus = makeFeather("plus");
export const ChevronLeft = makeFeather("chevron-left");
export const ShoppingCart = makeFeather("shopping-cart");
export const Minus = makeFeather("minus");
export const ArrowRight = makeFeather("arrow-right");
export const Clock = makeFeather("clock");
export const ShoppingBag = makeFeather("shopping-bag");
export const Tag = makeFeather("tag");
export const Sparkles = makeIon("sparkles");
