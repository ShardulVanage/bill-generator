import React from 'react';

const UberReceiptTemplate = ({ formData }) => {
  return (
   <div>
     <section className=" mt-2 scale-x-90 p-12">
        <div className="flex flex-row justify-between items-center ">       
            <img src="https://res.cloudinary.com/dtsuvx8dz/image/upload/v1732198619/yi2do5yzzjawzjthqics.png" alt="w" className=" w-14"/>
            <h1 className="text-gray-700 text-xs scale-90">{formData.longDate}</h1>
        </div>
        <hr className="mt-3  bg-black "/>
        
        <div className="mt-3">
            <h1 className="text-xl font-medium text-gray-950 scale-y-90">Here&apos;s your receipt for your ride, {formData.customerName}</h1>
        </div>
        <div>
            <p className="mt-4 text-gray-700 text-xs scale-y-95">We hope you enjoyed your ride this morning</p>
        </div>
        <div className="flex flex-row justify-between items-center  mt-6 scale-y-95 font-medium ">
            <h1 className="font-medium">Total</h1>
           <div className="mr-6">
               <p>₹{formData.totalAmount}</p>
           </div>
        </div>
        <hr className="mt-2 bg-black h-[0.04rem] "/>
        <div className="flex flex-row justify-between items-baseline mt-1.5  font-bold  text-xs   text-gray-500 pr-4">
            <h1 className="scale-90">Trip Charge</h1>
            <p className="scale-90">₹{formData.amount}</p>
        </div>

        <hr className="mt-1.5 bg-gray-600/90 h-[0.02rem]"/>
       <div className="">
        <div className="flex flex-row justify-between items-baseline mt-1.5    text-xs   text-gray-950 pr-3 ">
            <h1 className="font-bold scale-90">Subtotal</h1>
            <p className="scale-90">₹{formData.amount}</p>
        </div>
        <div className="flex flex-row justify-between items-baseline font-bold  text-xs -mt-4  text-gray-500 pr-2.5 ">
            <h1 className="scale-90">Booking Fee</h1>
            <p className="scale-90">₹{formData.bookingFee}</p>
        </div>
       </div>
       <hr className="mt-3 bg-gray-600/90 h-[0.02rem] "/>
       <hr className="mt-8 bg-gray-600/90 h-[0.02rem] "/>


       <div className="scale-y-95">
                <h1 className="font-medium mt-1">Payments</h1>
            <div className="flex flex-row w-full justify-center items-center mt-2 ">
                <div className="   mb-4  border-[0.1rem] border-gray-400 rounded-xl">
                    <img src="https://res.cloudinary.com/dtsuvx8dz/image/upload/v1732437522/nbmj0nr0daxfe5iai2v3.png" className="h-3.5 w-9  py-0.5 scale-75  bg-white " alt=""/>
                </div>
                <div className="flex flex-row justify-between w-full scale-y-95">
                    <div className="flex flex-col scale-75 ">
                        <h2 className="font-medium">Google Pay</h2>
                        <p className="mt-3 tracking-wide scale-y-90 text-gray-500">{formData.shortDate} {formData.formattedPaymentTime}</p>
                    </div>
                    <div className="scale-y-90">
                        ₹{formData.amount}
                    </div>
                </div>
            </div>
            <div>
                <p className="scale-y-90 text-xs -mt-5  tracking-tight text-[10px] font-medium"><span className="text-[#2731F2] underline underline-offset-4 decoration-[#2731F2]">Visit the trip page</span> for more information, including invoices (where available)</p>
                <p className="scale-y-90 text-xs   tracking-tight text-[10px] mt-4">The total of ₹{formData.amount} has a GST of ₹59.95 included.</p>
            </div>
       </div>
    </section>
    <hr className="w-[81%] mx-auto -mt-9 bg-gray-600/90 h-[0.02rem]"/>
    <section className=" mt-2 scale-x-90 px-12">
        <div className="ml-2">
            <p className="scale-y-95 text-xs text-[9.89px] tracking-tight text-black font-medium">You rode with {formData.riderName}</p>
            <p className="text-[8px]  font-medium -mt-3 ml-0.5">License Plate: {formData.numberPlate} </p>
        </div>
        <div className="flex flex-row items-start ml-2">
            <div className="flex flex-col font-medium">
                <p className="text-[9.95px]">Uber Go</p>
                <p className="text-[9.4px] text-gray-500 -mt-5">min</p>
            </div>
            <div className="text-[9.95px] ml-4 text-gray-500">
                <p>34.66 kilometers | {formData.duration}</p>
            </div>
        </div>
        <div>

            <div className="flex flex-row  items-start ml-3">
                <div className="flex flex-col justify-center items-center">
                    <div className="h-[7px] w-[7.5px] bg-black"></div>
                    <div className="h-5 w-[1px] bg-black"></div>
                    <div className="h-[7px] w-[7.5px] bg-black"></div>

                </div>
                <div className="flex flex-col justify-center items-start text-xs -mt-3.5 ml-1 scale-y-75 scale-x-90 ">
                    <p>{formData.formattedStartTime} | {formData.pickupAddress}</p>
                    <p className="">{formData.formattedEndTime} | {formData.dropToAddress}</p>
                </div>
            </div>
            <p className="scale-y-95 text-xs text-[9.8px] tracking-tight text-gray-500 font-medium  ml-3">Fares are inclusive of GST. Please download the tax invoice from the trip detail page for a full tax breakdown.</p>

        </div>

    </section>
    </div>
  );
};

export default UberReceiptTemplate;