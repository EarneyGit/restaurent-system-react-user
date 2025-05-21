import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import usePreventScroll from "../../hooks/usePreventScroll";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  usePreventScroll(isOpen);
  const [activeTab, setActiveTab] = useState("all");
  const [isRendered, setIsRendered] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  const tabItems = [
    { id: "all", name: "All" },
    { id: "news", name: "News" },
    { id: "orders", name: "Orders" },
    { id: "reservations", name: "Reservations" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 max-h-[90vh] w-full max-w-md border bg-white shadow-xl rounded-lg m-3 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 font-medium text-sm flex-1 transition-colors ${
                    activeTab === tab.id
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto  p-4 max-h-[60vh] flexitems-center justify-center">
            <div
              className={`transform transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-gray-600">
                Notifications not found according to your request Lorem ipsum
                dolor sit amet consectetur adipisicing elit. Voluptates,
                molestiae totam! Atque aperiam iusto cum dolor dolores ratione
                dolorum consectetur unde, odit, delectus nam mollitia debitis,
                repellat assumenda nesciunt dolore nihil ex ad sapiente
                doloremque temporibus veritatis earum voluptatem veniam?
                Repellendus sunt impedit veritatis illo nesciunt dolorum natus
                eligendi culpa adipisci vero facilis debitis vitae harum
                voluptas unde dicta doloribus, laboriosam fugiat quas officia
                pariatur. Consequuntur veniam suscipit maiores, dolorem, quos
                omnis ipsum quisquam, modi voluptas nostrum magnam molestiae
                reprehenderit quod minima hic quasi labore nihil! Saepe facilis
                repellat quam corporis? Eveniet omnis ipsam repudiandae quaerat
                error iure iusto deserunt. Lorem ipsum, dolor sit amet
                consectetur adipisicing elit. Eum, aliquam. Lorem ipsum dolor
                sit, amet consectetur adipisicing elit. Soluta eos consequatur,
                accusamus iusto ea pariatur corrupti quisquam possimus ipsum
                nulla quae magnam deserunt optio laborum recusandae animi modi!
                Molestias omnis cumque ex pariatur, suscipit numquam repellat,
                eos rerum iste doloremque corrupti nobis. Eaque ipsum ullam fuga
                dolores veritatis distinctio beatae earum, nemo, aspernatur
                totam soluta assumenda odit laborum adipisci neque? Fugiat quae
                odit deleniti odio quisquam vitae neque porro iusto ab.
                Recusandae assumenda nam tenetur. Accusamus voluptatem similique
                perspiciatis magni ducimus, veritatis, cumque id rem culpa ut a.
                Porro, maiores ipsam veniam nam perferendis praesentium facere
                qui accusantium consequuntur illo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
