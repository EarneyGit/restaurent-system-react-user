
import React from "react";

const Filters = () => {
  return (
    <div className="fixed right-4 top-1/3 z-10 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-center gap-2">
          <input type="radio" id="trust" name="filter" />
          <label htmlFor="trust" className="text-sm">Trust you</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="radio" id="rated" name="filter" checked />
          <label htmlFor="rated" className="text-sm font-medium">Highly rated</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="radio" id="delivery1" name="filter" />
          <label htmlFor="delivery1" className="text-sm">Fast delivery</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="radio" id="delivery2" name="filter" />
          <label htmlFor="delivery2" className="text-sm">Fast delivery</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="radio" id="inexpensive" name="filter" />
          <label htmlFor="inexpensive" className="text-sm">Inexpensive</label>
        </div>
      </div>
    </div>
  );
};

export default Filters;
