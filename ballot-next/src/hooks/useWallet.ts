"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function useWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>("-");
  const [status, setStatus] = useState<string>("Ожидание подключения");

  async function connectWallet(): Promise<void> {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask не найден");
        return;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);

      const currentSigner = await browserProvider.getSigner();
      const currentContract = new Contract(CONTRACT_ADDRESS, ABI, currentSigner);

      setProvider(browserProvider);
      setSigner(currentSigner);
      setContract(currentContract);
      setAccount(await currentSigner.getAddress());
      setStatus("Кошелек подключен");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Ошибка подключения";
      setStatus(message);
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown): Promise<void> => {
      if (!Array.isArray(accounts) || accounts.length === 0) {
        setAccount("-");
        setSigner(null);
        setContract(null);
        setStatus("Кошелек отключен");
        return;
      }
      try {
        const browserProvider = new BrowserProvider(window.ethereum!);
        const currentSigner = await browserProvider.getSigner();
        const currentContract = new Contract(CONTRACT_ADDRESS, ABI, currentSigner);

        setProvider(browserProvider);
        setSigner(currentSigner);
        setContract(currentContract);
        setAccount(await currentSigner.getAddress());
        setStatus("Аккаунт обновлен");
      } catch (error) {
        console.error(error);
      }
    };

    const handleChainChanged = (): void => {
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    status,
    setStatus,
    connectWallet,
  };
}