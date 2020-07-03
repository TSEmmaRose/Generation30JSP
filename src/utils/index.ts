import { MethodAbi } from 'ethereum-types'

export const parseDeployedContract = (
  contractName: string,
  contractAddress: string,
  abi: MethodAbi[]
) => {
  return {
    contractAddress,
    title: `${contractName} at ${shortenAddress(contractAddress)}`,
    abi: abi
      .filter(i => i.type !== 'constructor' && i.type !== 'event')
      .map(piece => {
        return {
          ...piece,
          combinedInputs: combineInputs(piece.inputs),
          loading: false,
          argsModel: '',
          res: undefined
        }
      })
  }
}

export const combineInputs = (
  inputs: Array<{ name: string; type: string }>
) => {
  return inputs
    .map(({ name, type }) => {
      return `${type.trim()} ${name.trim()}`
    })
    .join(',')
}

export const extractConst