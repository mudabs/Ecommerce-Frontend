import React, { useEffect } from 'react'
import InputField from '../shared/InputField'
import { useForm } from 'react-hook-form';
import { FaAddressCard } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import Spinners from '../shared/Spinners';
import toast from 'react-hot-toast';
import { addUpdateUserAddress } from '../../store/actions';

const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Chad", "Chile",
    "China", "Colombia", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia",
    "Ethiopia", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
    "Guatemala", "Guinea", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
    "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway",
    "Oman", "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea",
    "South Sudan", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey", "Turkmenistan", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const AddAddressForm = ({ address, setOpenAddressModal }) => {
    const dispatch = useDispatch();
    const { btnLoader } = useSelector((state) => state.errors);
    const {
            register,
            handleSubmit,
            reset,
            setValue,
            formState: {errors},
        } = useForm({
            mode: "onTouched",
        });

        const onSaveAddressHandler = async (data) => {
            dispatch(addUpdateUserAddress(
                data,
                toast,
                address?.addressId,
                setOpenAddressModal
            ));
        };


        useEffect(() => {
            if (address?.addressId) {
                setValue("buildingName", address?.buildingName);
                setValue("city", address?.city);
                setValue("street", address?.street);
                setValue("state", address?.state);
                setValue("pincode", address?.pincode);
                setValue("country", address?.country);
            }
        }, [address]);

  return (
    <div className="">
            <form
                onSubmit={handleSubmit(onSaveAddressHandler)}
                className="">
                    <div className="flex justify-center items-center mb-4 font-semibold text-2xl text-slate-800 py-2 px-4">
                        <FaAddressCard className="mr-2 text-2xl"/>
                        {!address?.addressId ? 
                        "Add Address" :
                        "Update Address"
                        }
                        
                    </div>
            <div className="flex flex-col gap-4">
                <InputField
                    label="Building Name"
                    required
                    id="buildingName"
                    type="text"
                    message="*Building Name is required"
                    min={5}
                    minMessage="Building name must be atleast 5 characters"
                    trimRequired
                    placeholder="Enter Building Name"
                    register={register}
                    errors={errors}
                    />

                <InputField
                    label="City"
                    required
                    id="city"
                    type="text"
                    message="*City is required"
                    min={4}
                    minMessage="City name must be atleast 4 characters"
                    trimRequired
                    placeholder="Enter City"
                    register={register}
                    errors={errors}
                    />

                <InputField
                    label="State"
                    required
                    id="state"
                    type="text"
                    message="*State is required"
                    min={2}
                    minMessage="State name must be atleast 2 characters"
                    trimRequired
                    placeholder="Enter State"
                    register={register}
                    errors={errors}
                    />

                <InputField
                    label="Pincode"
                    required
                    id="pincode"
                    type="text"
                    message="*Pincode is required"
                    min={4}
                    minMessage="Pincode must be at least 4 characters"
                    trimRequired
                    placeholder="Enter Pincode"
                    register={register}
                    errors={errors}
                    />    
                <InputField
                    label="Street"
                    required
                    id="street"
                    type="text"
                    message="*Street is required"
                    min={5}
                    minMessage="Street name must be atleast 5 characters"
                    trimRequired
                    placeholder="Enter Street"
                    register={register}
                    errors={errors}
                    />   

                <div className="flex flex-col gap-1">
                    <label htmlFor="country" className="text-sm font-medium text-slate-700">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="country"
                        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue ${errors.country ? 'border-red-500' : 'border-slate-300'}`}
                        {...register("country", { required: "*Country is required" })}
                    >
                        <option value="">-- Select Country --</option>
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {errors.country && (
                        <span className="text-red-500 text-xs">{errors.country.message}</span>
                    )}
                </div>
            </div>

            <button
                disabled={btnLoader}
                className="text-white bg-custom-blue px-4 py-2 rounded-md mt-4"
                type="submit">
                {btnLoader ? (
                    <>
                    <Spinners /> Loading...
                    </>
                ) : (
                    <>Save</>
                )}
            </button>
            </form>
        </div>
  )
}

export default AddAddressForm