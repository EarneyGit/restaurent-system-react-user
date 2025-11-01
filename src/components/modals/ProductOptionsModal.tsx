import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ProductAttribute } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useGuestCart } from "@/context/GuestCartContext";
import { useNavigate } from "react-router-dom";

interface SelectedAttributeItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

interface SelectedAttribute {
  attributeId: string;
  attributeName: string;
  attributeType: "single" | "multiple" | "multiple-times";
  selectedItems: SelectedAttributeItem[];
}

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    selectedAttributes: SelectedAttribute[],
    specialRequirements: string
  ) => void;
  productName: string;
  options: ProductAttribute[];
  productId?: string;
}

const ProductOptionsModal = ({
  isOpen,
  onClose,
  onAddToCart,
  productName,
  options,
  productId,
}: ProductOptionsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [quantities, setQuantities] = useState<
    Record<string, Record<string, number>>
  >({});
  const [specialRequirements, setSpecialRequirements] = useState("");

  const { isAuthenticated } = useAuth();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      setQuantities({});
      setSpecialRequirements("");
    }
  }, [isOpen]);

  const getTotalQuantity = (attrId: string) => {
    const attrQty = quantities[attrId] || {};
    return Object.values(attrQty).reduce((sum, q) => sum + q, 0);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const handleOptionSelect = (option: ProductAttribute, choiceId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[option.id] || [];
      let next: string[] = [];

      if (option.type === "single") {
        next = [choiceId];
      } else if (option.type === "multiple") {
        if (current.includes(choiceId)) {
          next = current.filter((id) => id !== choiceId);
        } else {
          next = [...current, choiceId];
        }
      }

      if (option.type === "multiple" && option.isMultipleTimes) {
        setQuantities((prevQty) => {
          const attr = prevQty[option.id] || {};
          const exists = current.includes(choiceId);
          const newAttr = { ...attr };

          if (!exists) {
            newAttr[choiceId] = 1;
          } else {
            delete newAttr[choiceId];
          }

          return { ...prevQty, [option.id]: newAttr };
        });
      }

      return { ...prev, [option.id]: next };
    });
  };

  const updateQuantity = (attrId: string, choiceId: string, delta: number) => {
    setQuantities((prev) => {
      const attr = prev[attrId] || {};
      const current = attr[choiceId] || 1;
      const next = current + delta;

      if (next < 1) return prev;

      const total = Object.values(attr).reduce((sum, q) => sum + q, 0);
      const option = options.find((o) => o.id === attrId);
      if (
        option &&
        option.maxAttribute &&
        total >= option.maxAttribute &&
        delta > 0
      ) {
        return prev;
      }

      const updated = { ...attr, [choiceId]: next };
      return { ...prev, [attrId]: updated };
    });
  };

  const validateForm = () => {
    const missing: string[] = [];

    for (const option of options) {
      const selected = selectedOptions[option.id] || [];
      const totalQty = getTotalQuantity(option.id);

      if (
        option.type === "single" &&
        option.requiresSelection &&
        selected.length === 0
      ) {
        missing.push(option.name);
      }

      if (option.type === "multiple" && !option.isMultipleTimes) {
        if (option.requiresSelection && selected.length === 0) {
          missing.push(option.name);
        }
      }

      if (option.type === "multiple" && option.isMultipleTimes) {
        console.log("totalQty", totalQty);
        const min = option.minAttribute || 0;
        const max = option.maxAttribute || Infinity;

        if (totalQty < min) {
          missing.push(`${option.name} (min ${min})`);
        } else if (totalQty > max) {
          missing.push(`${option.name} (max ${max})`);
        }
      }
    }

    if (missing.length > 0) {
      toast.error(`Please select the required items:\n${missing.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateForm()) return;

    if (!isAuthenticated && !sessionId) {
      localStorage.setItem("returnUrl", window.location.pathname);
      navigate("/login");
      onClose();
      return;
    }

    const selectedAttributes: SelectedAttribute[] = options
      .map((option) => {
        const selectedIds = selectedOptions[option.id] || [];
        const items: SelectedAttributeItem[] = [];

        for (const id of selectedIds) {
          const choice = option.choices.find((c) => c.id === id);
          if (!choice) continue;

          let qty = 1;
          if (option.isMultipleTimes && quantities[option.id]?.[id]) {
            qty = quantities[option.id][id];
          }

          items.push({
            itemId: id,
            itemName: choice.name,
            itemPrice: choice.price,
            quantity: qty,
          });
        }

        return {
          attributeId: option.id,
          attributeName: option.name,
          attributeType: option.type,
          selectedItems: items,
        };
      })
      .filter((attr) => attr.selectedItems.length > 0);

    onAddToCart(selectedAttributes, specialRequirements);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 bg-gray-50">
          <h2 className="text-xl font-medium text-gray-800">{productName}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-8 py-6 space-y-6">
          {options.map((option) => {
            const totalQty = getTotalQuantity(option.id);
            const isQuantityUpdateNeeded =
              option.type === "multiple" && option.isMultipleTimes === true;
            return (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-800">
                    {option.name}
                    {option.requiresSelection && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 italic">
                    {isQuantityUpdateNeeded &&
                      `Note : Please select at least ${option.minAttribute} and up to ${option.maxAttribute} items.`}
                  </p>
                </div>
                <div className="grid gap-2 ">
                  {option.choices.map((choice) => {
                    const selected = (
                      selectedOptions[option.id] || []
                    ).includes(choice.id);
                    const disabled =
                      option.isMultipleTimes &&
                      option.maxAttribute &&
                      totalQty >= option.maxAttribute &&
                      !selected;

                    const qty = quantities[option.id]?.[choice.id] || 0;

                    return (
                      <label
                        key={choice.id}
                        className={`flex items-center cursor-pointer justify-between px-4 py-3 border rounded-xl ${
                          selected
                            ? "border-yellow-600 bg-yellow-50"
                            : disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-yellow-600 hover:bg-yellow-50/30"
                        }`}
                        onClick={() => {
                          if (!disabled) handleOptionSelect(option, choice.id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={
                              option.type === "single" ? "radio" : "checkbox"
                            }
                            checked={selected}
                            disabled={disabled}
                            onChange={() =>
                              handleOptionSelect(option, choice.id)
                            }
                            className="w-4 h-4 text-yellow-600"
                          />
                          <span className="text-sm text-gray-700">
                            {choice.name}
                          </span>
                          {choice.price > 0 && (
                            <span className="text-xs text-gray-500">
                              +{formatPrice(choice.price)}
                            </span>
                          )}
                        </div>

                        {option.isMultipleTimes && selected && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(option.id, choice.id, -1);
                              }}
                              disabled={qty <= 1}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">
                              {qty || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(option.id, choice.id, 1);
                              }}
                              disabled={
                                option.maxAttribute &&
                                totalQty >= option.maxAttribute
                              }
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-medium text-gray-800">
              Special Requirements
            </h3>
            <textarea
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="E.g., allergies, special instructions..."
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-yellow-600/40"
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-yellow-50 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-yellow-700 text-white rounded-xl font-medium hover:bg-yellow-800"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
