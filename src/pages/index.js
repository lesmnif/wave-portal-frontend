import { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/WavePortal.json"
import { toast } from "react-hot-toast"
import Modal from "../components/Modal"

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
  const [isLoading, setIsLoading] = useState(false)
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)


  const contractAddress = "0xcaE64B60e770D0039e63b3Af86aa6369E1F27a9B"
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

  const getAllWaves = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const waves = await wavePortalContract.getAllWaves()
  
        let wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          })
        })
        
        setAllWaves(wavesCleaned)
        wavesCleaned.length === 0
          ? toast.error("You haven't waved yet!")
          : toast.success("Here we go!")
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (textareaMessage) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        setOpen(false)
        setIsLoading(true)
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        const waveTxn = await wavePortalContract.wave(textareaMessage)
        console.log("Mining...", waveTxn.hash)
        toast.loading("Mining your wave...", {
          duration: Infinity,
        })
        await waveTxn.wait()
        const waves = await wavePortalContract.getAllWaves()

        const wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          })
        })

        setAllWaves(wavesCleaned)
        toast.dismiss()
        toast.success(`Finished mining your wave! You've also won 0.0001 ETH!`, {
          duration: 5000,
          icon: "😲",
        })
        setIsLoading(false)
      } else {
        toast.dismiss()
        setIsLoading(false)
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      toast.dismiss()
      setIsLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account)
        setIsLoading(false)
      }
    })
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            👋 Hey there, wave at me and win some ETH!
          </h2>
          <Modal
            open={open}
            setOpen={setOpen}
            wave={wave}
            message={message}
            setMessage={setMessage}
          />
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
              <button
                disabled={isLoading}
                className="rounded-md hover:cursor-pointer bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => setOpen(true)}
              >
                Wave at me!
              </button>
              <div
                className=" hover:cursor-pointer text-sm font-semibold leading-6 text-white"
                onClick={getAllWaves}
              >
                How many people waved?
              </div>
            </div>
          )}
          {allWaves.length !== 0 && (
            <div className="bg-gray-900 py-5 text-white rounded-lg border-gray-800 border mt-7">
              <table className=" w-full whitespace-nowrap text-left">
                <colgroup>
                  <col className="w-full sm:w-4/12" />
                  <col className="lg:w-4/12" />
                  <col className="lg:w-2/12" />
                  <col className="lg:w-1/12" />
                  <col className="lg:w-1/12" />
                </colgroup>
                <thead className="border-b border-white/10 text-sm leading-6 text-white">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
                    >
                      Message
                    </th>
                    <th
                      scope="col"
                      className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20 hidden sm:block"
                    >
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allWaves.map((item) => (
                    <tr key={item.commit} className="text-white">
                      <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                        <div className="flex items-center gap-x-4">
                          <div className="truncate text-sm font-medium leading-6 text-white">
                            {item.message}
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-gray-400">
                            {item.address}
                          </div>
                          {/* <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                          {item.message}
                        </div> */}
                        </div>
                      </td>
                      <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20 hidden sm:block">
                        <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                          <time
                            className="text-gray-400 sm:hidden"
                            dateTime={item.timestamp.toString()}
                          >
                            {item.timestamp.toLocaleString([], {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                          <div className="hidden text-white sm:block">
                            {item.timestamp.toLocaleString([], {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
