"use client";
import {
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { Button, Input, Select } from "@worldcoin/mini-apps-ui-kit-react";
import { useState } from "react";
import { useMiniKit } from "@/hooks/useMiniKit";

const sendPayment = async (recipientAddress: string, selectedToken: Tokens, amount: number, payCommand: any) => {
  try {
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
    });

    const { id } = await res.json();

    console.log(id);

    const payload: PayCommandInput = {
      reference: id,
      to: recipientAddress,
      tokens: [
        {
          symbol: selectedToken,
          token_amount: tokenToDecimals(amount, selectedToken).toString(),
        },
      ],
      description: "Thanks for the coffee! ☕",
    };
    if (payCommand) {
      return await payCommand(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async (
  recipientAddress: string,
  selectedToken: Tokens,
  amount: number,
  setStatus: (status: string | null) => void,
  isInstalled: () => boolean,
  payCommand: any
) => {
  if (!isInstalled()) {
    setStatus("MiniKit is not installed");
    return;
  }

  setStatus("Processing payment...");
  const sendPaymentResponse = await sendPayment(recipientAddress, selectedToken, amount, payCommand);
  const response = sendPaymentResponse?.finalPayload;

  if (!response) {
    setStatus("Payment failed");
    return;
  }

  if (response.status == "success") {
    const res = await fetch(`/api/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: response }),
    });
    const payment = await res.json();
    if (payment.success) {
      setStatus("Thank you for the coffee! ☕");
    } else {
      setStatus("Payment confirmation failed");
    }
  } else {
    setStatus("Payment failed");
  }
};

export const PayBlock = () => {
  const [recipientAddress, setRecipientAddress] = useState(process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || "");
  const [selectedToken, setSelectedToken] = useState<Tokens>(Tokens.WLD);
  const [amount, setAmount] = useState<number>(0.5);
  const [status, setStatus] = useState<string | null>(null);
  const { isMiniApp, isInstalled, commandsAsync } = useMiniKit();

  if (!isMiniApp) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold">Buy me a coffee ☕</h3>
        <div className="text-gray-600 text-sm">
          Running in web mode - payments not available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold">Buy me a coffee ☕</h3>
      <p className="text-center text-gray-600 mb-4">
        Enjoyed this app? Buy me a coffee! 🎉 Or change the address to support someone else!
      </p>

      <div className="w-full space-y-4">
        <Input
          label="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
        />

        <div className="flex gap-4">
          <Select
            label="Token"
            value={selectedToken}
            onChange={(value) => setSelectedToken(value as Tokens)}
            options={[
              { label: "WLD", value: Tokens.WLD },
              { label: "USDC", value: Tokens.USDCE }
            ]}
            className="flex-1"
          />

          <Input
            label="Amount"
            type="number"
            value={amount.toString()}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="0.5"
            className="flex-1"
          />
        </div>
      </div>

      <Button
        onClick={() => handlePay(recipientAddress, selectedToken, amount, setStatus, isInstalled, commandsAsync.pay)}
        className="w-full mt-2"
      >
        Buy Coffee
      </Button>

      {status && (
        <div className={`mt-2 text-center ${status.includes("Thank you") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </div>
      )}
    </div>
  );
};
