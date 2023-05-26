import { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/WavePortal.json"
import { toast } from "react-hot-toast"

const getEthereumObject = () => window.ethereum

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject()

    if (!ethereum) {
      console.error("Make sure you have Metamask!")
      return null
    }

    console.log("We have the Ethereum object", ethereum)
    const accounts = await ethereum.request({ method: "eth_accounts" })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account)
      return account
    } else {
      console.error("No authorized account found")
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export default function Index() {
  const [currentAccount, setCurrentAccount] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const contractAddress = "0x4E49d7f7947a43012180293B3E9C84fEA77212AB"
  const contractABI = abi.abi
  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject()
      if (!ethereum) {
        alert("Get MetaMask extension!")
        return
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.error(error)
    }
  }

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const userAddress = ethereum.selectedAddress
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        console.log("hello", contractAddress, contractABI, signer)

        const count = await wavePortalContract.getTotalWaves(userAddress)
        toast.success(`You've waved a total of ${count.toNumber()} times`, {
          icon: "👋",
        })
        console.log("Retrieved total wave count...", count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const userAddress = ethereum.selectedAddress
        const provider = new ethers.providers.Web3Provider(ethereum)
        console.log("this is my provider", provider)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        console.log("this is my userAdress", userAddress)
        const user = await wavePortalContract.getUserMap(userAddress)
        console.log("my user is that: ", user)
        const waveTxn = await wavePortalContract.wave(userAddress)
        console.log("Mining...", waveTxn.hash)
        toast.loading("Mining your wave...", {
          duration: Infinity,
        })
        await waveTxn.wait()
        const count = await wavePortalContract.getTotalWaves(userAddress)
        toast.dismiss()
        toast.success(
          `Finished mining your wave! You've waved ${count.toNumber()} times! `,
          {
            duration: 5000,
            icon: "😲",
          }
        )
      } else {
        toast.dismiss()
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      toast.dismiss()
      console.log(error)
    }
  }

  const authorizeAccount = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const userAddress = ethereum.selectedAddress
        const provider = new ethers.providers.Web3Provider(ethereum)
        console.log("this is my provider", provider)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        console.log("this is my contract", wavePortalContract)
        const user = await wavePortalContract.getUserMap(userAddress)
        console.log("this is my authorized", user.isAuthorized)
        if (!user.isAuthorized) {
          if (window.confirm("You need to authorize this account to wave:")) {
            const auth = await wavePortalContract.toggleAuthorization(
              userAddress
            )
            toast.loading("Authorizing account...", {
              duration: Infinity,
            })
            await auth.wait()
            toast.dismiss()
            toast.success("Successfully authenticated, you can wave now!")
          }
        }
        console.log("I was alreayd authenticated")
      } else {
        toast.dismiss()
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      toast.dismiss()
      console.log(error)
    }
  }

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account)
        authorizeAccount()
        setIsLoading(false)
      }
    })
  }, [])

  return (
    <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              👋 Hey there!
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              I am Bogdan and I love working on AI stuff, reading and playing
              piano. Make sure to wave at me!
            </p>
            {!currentAccount ? (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <div
                  className="rounded-md hover:cursor-pointer bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={wave}
                >
                  Wave at me!
                </div>
                <div
                  className=" hover:cursor-pointer text-sm font-semibold leading-6 text-white"
                  onClick={getTotalWaves}
                >
                  How many times I waved?
                </div>
              </div>
            )}
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
    </div>
  )
}
