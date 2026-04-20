"use client"

import dynamic from "next/dynamic"

export const SocialProof       = dynamic(() => import("@/components/sections/SocialProof"))
export const ProductGrid       = dynamic(() => import("@/components/sections/ProductGrid"))
export const AboutSection      = dynamic(() => import("@/components/sections/AboutSection"))
export const InstagramFeed     = dynamic(() => import("@/components/sections/InstagramFeed"))
export const LocationSection   = dynamic(() => import("@/components/sections/LocationSection"))
export const ConversionSection = dynamic(() => import("@/components/sections/ConversionSection"))
export const FaqSection        = dynamic(() => import("@/components/sections/FaqSection"))