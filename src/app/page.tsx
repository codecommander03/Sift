"use client";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Product as TProduct } from "@/db";
import { cn } from "@/lib/utils";
import { ProductState } from "@/lib/validators/product-validator";
import { AccordionContent } from "@radix-ui/react-accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Label } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";

const SORT_OPTIONS = [
    { name: "None", value: "none" },
    { name: "Price: Low to High", value: "price-asc" },
    { name: "Price: High to Low", value: "price-desc" },
] as const;

const COLOR_FILTERS = {
    id: "color",
    name: "Color",
    options: [
        { value: "white", label: "White" },
        { value: "beige", label: "Beige" },
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "purple", label: "Purple" },
    ] as const,
};


const SIZE_FILTERS = {
    id: "size",
    name: "Size",
    options: [
        { value: "S", label: "S", },
        { value: "M", label: "M", },
        { value: "L", label: "L", },
    ]
} as const;

const PRICE_FILTERS = {
    id: "price",
    name: "Price",
    options: [{
        value: [0, 100],
        label: "Any Price"
    }, {
        value: [0, 20],
        label: "Under 20$" 
    },{
        value: [0, 40],
        label: "Under 40$"
        },
        // Custom option defined in JSX
    ]
} as const;

const SUBCATEGORIES = [
    { name: "T-Shirts", selected: true, href: "#" },
    { name: "Hoodies", selcted: false, href: "#" },
    { name: "Sweatshirts", selcted: false, href: "#" },
    { name: "Accessories", selcted: false, href: "#" },
];

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
    const [filter, setFilter] = useState<ProductState>({
        color: ["white", "beige", "blue", "green", "purple"],
        price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
        size: ["S", "M", "L"],
        sort: ["none"]
    });

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data } = await axios.post<QueryResult<TProduct>[]>("http://localhost:3000/api/products", {
                filter: {
                    sort: filter.sort
                }
            })
            return data;
        }
    });

    const applyArrayFilter = ({
        category, value
    }: {
        category: keyof Omit<typeof filter, "price" | "sort">,
        value: string
    }) => {
        const isFilterAplied = filter[category].includes(value as never);
        if (isFilterAplied) {
            setFilter((prev) => ({
                ...prev,
                [category]: prev[category].filter((v) => v !== value)
            }))
        } else {
            setFilter((prev) => ({
                ...prev,
                [category]: [...prev[category], value]
            }))
        
        }
    }
    
    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    High quality cotton selection
                </h1>
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                            Sort
                            <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {SORT_OPTIONS.map(option => (
                                <button
                                    key={option.name}
                                    className={cn('text-left w-full block px-4 py-2 text-sm', {
                                        "text-gray-900 bg-gray-100": filter.sort.includes(option.value),
                                        "text-gray-500": !filter.sort.includes(option.value),
                                    })}
                                    onClick={() => {
                                        setFilter((prev) => ({
                                            ...prev,
                                            sort: [option.value]
                                        }))
                                    }}
                                >
                                {option.name}
                                </button>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <section className="pb-24 pt-6">
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                    {/*Filter*/}
                    <div className="hidden lg:block">
                        <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900 ">
                            {SUBCATEGORIES.map((category) => (
                                <li key={category.name}>
                                    <button
                                        className="disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={category.selected}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <Accordion type="multiple" className="animate-none">
                            {/*Color Filter*/}
                            <AccordionItem value='color'>
                                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                                    <span className="font-medium text-gray-900">Color</span>
                                </AccordionTrigger>

                                <AccordionContent className="pt-6 animate-none">
                                    <ul className="space-y-4">{COLOR_FILTERS.options.map((option, optionId) => (
                                        <li key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`color-${optionId}`}
                                                onChange={() => {
                                                    applyArrayFilter({
                                                        category: "color",
                                                        value: option.value
                                                    })
                                                }}
                                                checked={filter.color.includes(option.value)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`color-${optionId}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                                        </li>
                                    ))}</ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/*Size Filter*/}
                            <AccordionItem value='size'>
                                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                                    <span className="font-medium text-gray-900">Size</span>
                                </AccordionTrigger>

                                <AccordionContent className="pt-6 animate-none">
                                    <ul className="space-y-4">{SIZE_FILTERS.options.map((option, optionId) => (
                                        <li key={option.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`size-${optionId}`}
                                                onChange={() => {
                                                    applyArrayFilter({
                                                        category: "size",
                                                        value: option.value
                                                    })
                                                }}
                                                checked={filter.size.includes(option.value)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`size-${optionId}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                                        </li>
                                    ))}</ul>
                                </AccordionContent>
                            </AccordionItem>
                            
                            {/*Price Filter*/}
                            <AccordionItem value='price'>
                                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                                    <span className="font-medium text-gray-900">Price</span>
                                </AccordionTrigger>

                                <AccordionContent className="pt-6 animate-none">
                                    <ul className="space-y-4">{PRICE_FILTERS.options.map((option, optionId) => (
                                        <li key={option.label} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`price-${optionId}`}
                                                onChange={() => {
                                                    setFilter((prev) => ({
                                                        ...prev,
                                                        price: {
                                                            isCustom: false,
                                                            range: [...option.value]
                                                        }
                                                    }))
                                                }}
                                                checked={
                                                    !filter.price.isCustom
                                                    && filter.price.range[0] === option.value[0]
                                                    && filter.price.range[1] === option.value[1]
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`price-${optionId}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                                        </li>
                                    ))}
                                        <li className="flex justify-center flex-col gap-2">
                                            <div>
                                                <input
                                                type="radio"
                                                id={`price-${PRICE_FILTERS.options.length}`}
                                                onChange={() => {
                                                    setFilter((prev) => ({
                                                        ...prev,
                                                        price: {
                                                            isCustom: true,
                                                            range: [0, 100]
                                                        }
                                                    }))
                                                }}
                                                checked={filter.price.isCustom}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`price-${PRICE_FILTERS.options.length}`} className="ml-3 text-sm text-gray-600">Custom</label>
                                            </div>
                                            <div className="flex justify-between">
                                                <p className="font-medium">Price</p>
                                                <div>
                                                    {filter.price.isCustom ? }
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/*Product grid*/}
                    <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {products ? products.map((product) => (
                            <Product key={product.id} product={product.metadata!} />
                        )) : new Array(12).fill(null).map((_, i) => (
                            <ProductSkeleton key={i} />
                        )) }
                    </ul>
                </div>
            </section>
        </main>
    );
}