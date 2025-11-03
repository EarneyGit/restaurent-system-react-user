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
    // console.log("Qty", attrQty);
    let total = 0;
    for (const qty of Object.values(attrQty)) {
      total = total + qty;
      console.log("tl", total);
    }
    return total;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const handleOptionSelect = (option: ProductAttribute, choiceId: string) => {
    const currentSelections = selectedOptions[option.id] || [];
    const isAlreadySelected = currentSelections.includes(choiceId);

    if (option.type === "single") {
      setSelectedOptions({
        ...selectedOptions,
        [option.id]: [choiceId],
      });
      return;
    }

    if (option.type === "multiple") {
      if (isAlreadySelected) {
        const newSelections = currentSelections?.filter((id) => id !== choiceId);
        setSelectedOptions({ ...selectedOptions, [option.id]: newSelections });

        if (option.isMultipleTimes) {
          const newQty = { ...quantities[option.id] };
          delete newQty[choiceId];
          setQuantities({
            ...quantities,
            [option.id]: newQty,
          });
        }
      } else {
        if (option.isMultipleTimes) {
          const totalQty = getTotalQuantity(option.id);
          console.log("mt_totalQty",totalQty);
          const max = option.maxAttribute || 0;
          if (totalQty >= max) {
            return;
          }

          setSelectedOptions({
            ...selectedOptions,
            [option.id]: [...currentSelections, choiceId],
          });

          const currentQty = quantities[option.id] || {};
          setQuantities({
            ...quantities,
            [option.id]: {
              ...currentQty,
              [choiceId]: 1,
            },
          });
        } else {
          const currentCount = currentSelections.length;
          const max = option.maxAttribute || 0;
          if (currentCount >= max) {
            return;
          }

          setSelectedOptions({
            ...selectedOptions,
            [option.id]: [...currentSelections, choiceId],
          });
        }
      }
    }
  };

  const updateQuantity = (attrId: string, choiceId: string, delta: number) => {
    const option = options.find((o) => o.id === attrId);
    if (!option) return;

    const currentQty = quantities[attrId]?.[choiceId] || 1;
    const newQty = currentQty + delta;

    if (newQty < 1) {
      return;
    }

    if (option.maxAttribute) {
      const otherItemsQty = getTotalQuantity(attrId) - currentQty;
      const newTotal = otherItemsQty + newQty;
      if (newTotal > option.maxAttribute) {
        return;
      }
    }

    const allQty = quantities[attrId] || {};
    setQuantities({
      ...quantities,
      [attrId]: {
        ...allQty,
        [choiceId]: newQty,
      },
    });
  };

  // Seperate disable function for easy handling based on type.
  const isItemDisabled = (option: ProductAttribute, choiceId: string) => {
    const currentSelections = selectedOptions[option.id] || [];
    const isSelected = currentSelections.includes(choiceId);

    if (isSelected) {
      return false;
    }

    if (option.type === "single") {
      return false;
    }

    if (option.type === "multiple") {
      if (option.isMultipleTimes) {
        const totalQty = getTotalQuantity(option.id);
        const max = option.maxAttribute || 0;
        if (totalQty >= max) {
          return true;
        }
      } else {
        const selectedCount = currentSelections.length;
        const max = option.maxAttribute || 0;
        if (selectedCount >= max) {
          return true;
        }
      }
    }

    return false;
  };

  const validateForm = () => {
    for (const option of options) {
      console.log("option", option);
      const selected = selectedOptions[option.id] || [];
      const selectedCount = selected.length;

      console.log("selected", selected);
      if (option.type === "single") {
        if (option.requiresSelection && selectedCount === 0) {
          toast.error(`Please select ${option.name}`);
          return false;
        }
      }

      if (option.type === "multiple") {
        if (option.isMultipleTimes) {
          const totalQty = getTotalQuantity(option.id);
          const min = option.minAttribute || 0;
          const max = option.maxAttribute || 0;

          if (totalQty < min) {
            toast.error(`${option.name}: Please select at least ${min} items`);
            return false;
          }

          if (totalQty > max) {
            toast.error(`${option.name}: Maximum ${max} items allowed`);
            return false;
          }
        } else {
          const min = option?.minAttribute || 0;
          const max = option?.maxAttribute || 0;

          console.log("selectedCount", selectedCount);
          console.log("min", min);

          if (selectedCount < min) {
            toast.error(`${option.name}: Please select at least ${min} items`);
            return false;
          }

          if (selectedCount > max) {
            toast.error(`${option.name}: Maximum ${max} items allowed`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated && !sessionId) {
      localStorage.setItem("returnUrl", window.location.pathname);
      navigate("/login");
      onClose();
      return;
    }

    const selectedAttributes = [];

    for (const option of options) {
      const selectedIds = selectedOptions[option.id] || [];

      if (selectedIds.length === 0) {
        continue;
      }

      const items = [];

      for (const choiceId of selectedIds) {
        const choice = option.choices.find((c) => c.id === choiceId);
        if (!choice) continue;

        let qty = 1;
        if (option.isMultipleTimes) {
          qty = quantities[option.id]?.[choiceId] || 1;
        }

        items.push({
          itemId: choiceId,
          itemName: choice.name,
          itemPrice: choice.price,
          quantity: qty,
        });
      }

      selectedAttributes.push({
        attributeId: option.id,
        attributeName: option.name,
        attributeType: option.type,
        selectedItems: items,
      });
    }

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
            const isQuantityLimited =
              option.type === "multiple" &&
              option.minAttribute !== 0 &&
              option.maxAttribute !== 0;
            return (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-800">
                    {option.name}
                    {option.requiresSelection && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  {isQuantityLimited && (
                    <p className="text-sm text-gray-500 italic">
                      Note: Please select at least {option.minAttribute || 0}{" "}
                      and up to {option.maxAttribute} items.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  {option?.choices?.map((choice) => {
                    const isSelected = (
                      selectedOptions[option.id] || []
                    ).includes(choice.id);
                    const isDisabled = isItemDisabled(option, choice.id);
                    const qty = quantities[option.id]?.[choice.id] || 0;

                    return (
                      <label
                        key={choice.id}
                        className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer ${
                          isSelected
                            ? "border-yellow-600 bg-yellow-50"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100"
                            : "border-gray-200 hover:border-yellow-600 hover:bg-yellow-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={
                              option.type === "single" ? "radio" : "checkbox"
                            }
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => {
                              if (!isDisabled) {
                                handleOptionSelect(option, choice.id);
                              }
                            }}
                            className="w-4 h-4 text-yellow-600 cursor-pointer"
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

                        {option.isMultipleTimes && isSelected && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(option.id, choice.id, -1);
                              }}
                              disabled={qty <= 1}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
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
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-yellow-600/40 focus:border-yellow-600 outline-none"
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-yellow-50 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-yellow-700 text-white rounded-xl font-medium hover:bg-yellow-800 transition-colors"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
