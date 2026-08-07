import { saveSetupStep } from "../../actions/setup";
import SliderStep from "../../../components/SliderStep";

export default function InvestAmountPage() {
  async function handleNext(formData: FormData) {
    'use server';
    const amount = formData.get('investAmount') as string;
    await saveSetupStep({ investAmount: amount }, '/setup/net-worth');
  }

  return (
    <SliderStep 
      title="How much are you looking to invest (in USD)?"
      name="investAmount"
      min={0}
      max={1000000}
      step={500}
      defaultValue={10000}
      suffix=" a year"
      action={handleNext}
    />
  );
}
