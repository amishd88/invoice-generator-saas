import React from 'react'
import { Building } from 'lucide-react'

type CompanyInfoProps = {
  company: string
  companyAddress: string
  dispatch: React.Dispatch<any> // Consider defining a more specific action type
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ company, companyAddress, dispatch }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Building className="text-blue-600" /> Company Information
      </h2>
      <input
        value={company}
        onChange={e => dispatch({ company: e.target.value })}
        className="w-full p-2 border rounded-lg"
        placeholder="Company Name"
      />
      <textarea
        value={companyAddress}
        onChange={e => dispatch({ companyAddress: e.target.value })}
        className="w-full p-2 border rounded-lg h-24"
        placeholder="Company Address"
      />
    </div>
  )
}

export default CompanyInfo
