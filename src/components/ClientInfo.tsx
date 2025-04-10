import React from 'react'
import { User } from 'lucide-react'
import { Customer } from '../types'

type ClientInfoProps = {
  client: string
  clientAddress: string
  dispatch: React.Dispatch<any> // Consider defining a more specific action type
  onSelectCustomer?: (customer: Customer) => void
  onSaveCurrentAsCustomer?: () => void
}

const ClientInfo: React.FC<ClientInfoProps> = ({ 
  client, 
  clientAddress, 
  dispatch, 
  onSelectCustomer, 
  onSaveCurrentAsCustomer 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <User className="text-green-600" /> Client Information
      </h2>
      <input
        value={client}
        onChange={e => dispatch({ client: e.target.value })}
        className="w-full p-2 border rounded-lg"
        placeholder="Client Name"
      />
      <textarea
        value={clientAddress}
        onChange={e => dispatch({ clientAddress: e.target.value })}
        className="w-full p-2 border rounded-lg h-24"
        placeholder="Client Address"
      />
    </div>
  )
}

export default ClientInfo
