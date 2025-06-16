import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, DollarSign, TrendingUp, Home, AlertCircle } from 'lucide-react';
import { Listing } from '../types/listing';

interface InvestmentCalculatorProps {
  listing?: Listing;
}

interface CalculationResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyRental: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  capRate: number;
  roiPercent: number;
  breakEvenMonths: number;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ listing }) => {
  // Input values
  const [purchasePrice, setPurchasePrice] = useState(listing?.price || 300000);
  const [downPayment, setDownPayment] = useState(20); // percentage
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTerm, setLoanTerm] = useState(30); // years
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [vacancyRate, setVacancyRate] = useState(5); // percentage
  const [propertyTaxes, setPropertyTaxes] = useState(3600); // annual
  const [insurance, setInsurance] = useState(1200); // annual
  const [maintenance, setMaintenance] = useState(150); // monthly
  const [propertyManagement, setPropertyManagement] = useState(10); // percentage of rent
  const [closingCosts, setClosingCosts] = useState(5000);
  const [rehab, setRehab] = useState(0);

  const [results, setResults] = useState<CalculationResults | null>(null);

  useEffect(() => {
    calculateInvestment();
  }, [
    purchasePrice, downPayment, interestRate, loanTerm, monthlyRent,
    vacancyRate, propertyTaxes, insurance, maintenance, propertyManagement,
    closingCosts, rehab
  ]);

  const calculateInvestment = () => {
    // Basic calculations
    const downPaymentAmount = (purchasePrice * downPayment) / 100;
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly payment calculation (P&I)
    const monthlyPayment = monthlyInterestRate > 0 
      ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      : loanAmount / numberOfPayments;

    // Total costs
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    // Rental income calculations
    const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);
    const monthlyPropertyTaxes = propertyTaxes / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPropertyManagement = (monthlyRent * propertyManagement) / 100;

    // Monthly expenses
    const monthlyExpenses = monthlyPayment + monthlyPropertyTaxes + monthlyInsurance + 
                           maintenance + monthlyPropertyManagement;

    // Cash flow
    const monthlyCashFlow = effectiveMonthlyRent - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Investment metrics
    const totalCashInvested = downPaymentAmount + closingCosts + rehab;
    const cashOnCashReturn = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
    
    // Cap rate (NOI / Purchase Price)
    const annualNOI = (effectiveMonthlyRent * 12) - (monthlyPropertyTaxes * 12) - 
                     (monthlyInsurance * 12) - (maintenance * 12) - (monthlyPropertyManagement * 12);
    const capRate = (annualNOI / purchasePrice) * 100;

    // ROI calculation
    const roiPercent = totalCashInvested > 0 ? ((annualCashFlow * 10) / totalCashInvested) * 100 : 0;

    // Break-even calculation
    const breakEvenMonths = totalCashInvested > 0 && monthlyCashFlow > 0 
      ? totalCashInvested / monthlyCashFlow 
      : 0;

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      monthlyRental: effectiveMonthlyRent,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
      roiPercent,
      breakEvenMonths
    });
  };

  const getScoreColor = (value: number, good: number, excellent: number) => {
    if (value >= excellent) return 'text-green-600 bg-green-50';
    if (value >= good) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreText = (value: number, good: number, excellent: number) => {
    if (value >= excellent) return 'Excellent';
    if (value >= good) return 'Good';
    return 'Poor';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Investment Calculator
          {listing && (
            <Badge variant="outline" className="ml-2">
              {listing.address.split(',')[0]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="results">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6 mt-4">
            {/* Purchase Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Home className="w-4 h-4" />
                Purchase Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Price</Label>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Closing Costs</Label>
                  <Input
                    type="number"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Down Payment: {downPayment}%</Label>
                <Slider
                  value={[downPayment]}
                  onValueChange={([value]) => setDownPayment(value)}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Amount: ${((purchasePrice * downPayment) / 100).toLocaleString()}
                </div>
              </div>

              <div>
                <Label>Interest Rate: {interestRate}%</Label>
                <Slider
                  value={[interestRate]}
                  onValueChange={([value]) => setInterestRate(value)}
                  max={12}
                  min={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Rental Income */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rental Income
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Rent</Label>
                  <Input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Vacancy Rate: {vacancyRate}%</Label>
                  <Slider
                    value={[vacancyRate]}
                    onValueChange={([value]) => setVacancyRate(value)}
                    max={20}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-4">
              <h3 className="font-semibold">Monthly Expenses</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Taxes (Annual)</Label>
                  <Input
                    type="number"
                    value={propertyTaxes}
                    onChange={(e) => setPropertyTaxes(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Insurance (Annual)</Label>
                  <Input
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Maintenance (Monthly)</Label>
                  <Input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Property Mgmt: {propertyManagement}%</Label>
                  <Slider
                    value={[propertyManagement]}
                    onValueChange={([value]) => setPropertyManagement(value)}
                    max={20}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            {results && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${results.monthlyCashFlow.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Monthly Cash Flow</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(results.cashOnCashReturn, 8, 12)}`}>
                        {results.cashOnCashReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Cash-on-Cash Return</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(results.capRate, 6, 10)}`}>
                        {results.capRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Cap Rate</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.breakEvenMonths > 0 ? results.breakEvenMonths.toFixed(0) : '∞'}
                      </div>
                      <div className="text-sm text-gray-500">Break-even (Months)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment Quality Score */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Investment Quality
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Cash-on-Cash Return</span>
                        <Badge className={getScoreColor(results.cashOnCashReturn, 8, 12)}>
                          {getScoreText(results.cashOnCashReturn, 8, 12)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cap Rate</span>
                        <Badge className={getScoreColor(results.capRate, 6, 10)}>
                          {getScoreText(results.capRate, 6, 10)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cash Flow</span>
                        <Badge className={results.monthlyCashFlow > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                          {results.monthlyCashFlow > 0 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Breakdown */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Monthly Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Rental Income (after vacancy)</span>
                        <span className="text-green-600">+${results.monthlyRental.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mortgage Payment (P&I)</span>
                        <span className="text-red-600">-${results.monthlyPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Taxes</span>
                        <span className="text-red-600">-${(propertyTaxes / 12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span className="text-red-600">-${(insurance / 12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance</span>
                        <span className="text-red-600">-${maintenance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Management</span>
                        <span className="text-red-600">-${((monthlyRent * propertyManagement) / 100).toLocaleString()}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Net Cash Flow</span>
                        <span className={results.monthlyCashFlow > 0 ? 'text-green-600' : 'text-red-600'}>
                          {results.monthlyCashFlow > 0 ? '+' : ''}${results.monthlyCashFlow.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {(results.monthlyCashFlow < 0 || results.cashOnCashReturn < 5) && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">Investment Warnings</h4>
                          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                            {results.monthlyCashFlow < 0 && (
                              <li>• Negative cash flow - you'll need to pay monthly</li>
                            )}
                            {results.cashOnCashReturn < 5 && (
                              <li>• Low return rate - consider savings accounts or other investments</li>
                            )}
                            {results.capRate < 4 && (
                              <li>• Low cap rate indicates overpriced property</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};