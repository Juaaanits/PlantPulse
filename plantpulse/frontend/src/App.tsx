import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Droplets, Thermometer, Sun, AlertTriangle, Wifi, Battery, Download, FileText, ChevronDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';

// Simulated sensor data generator
const generateSensorData = () => ({
  timestamp: new Date().toLocaleTimeString(),
  soilMoisture: Math.floor(Math.random() * 40) + 30, // 30-70%
  temperature: Math.floor(Math.random() * 15) + 18, // 18-33°C
  lightLevel: Math.floor(Math.random() * 500) + 200, // 200-700 lux
  ph: (Math.random() * 2 + 6).toFixed(1), // 6.0-8.0
  humidity: Math.floor(Math.random() * 30) + 40 // 40-70%
});

const PlantPulseDashboard = () => {
  const [currentData, setCurrentData] = useState(generateSensorData());
  type SensorData = {
    timestamp: string;
    soilMoisture: number;
    temperature: number;
    lightLevel: number;
    ph: string;
    humidity: number;
  };

  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const plantNames = ['Monstera Deliciosa', 'Snake Plant', 'Pothos'] as const;
  type PlantName = typeof plantNames[number];

  const [selectedPlant, setSelectedPlant] = useState<PlantName>('Monstera Deliciosa');
  const [showReportModal, setShowReportModal] = useState(false);

  // Plant profiles with optimal ranges
  const plantProfiles: Record<PlantName, { moistureRange: number[]; tempRange: number[] }> = {
    'Monstera Deliciosa': { moistureRange: [40, 60], tempRange: [18, 24] },
    'Snake Plant': { moistureRange: [20, 40], tempRange: [15, 25] },
    'Pothos': { moistureRange: [50, 70], tempRange: [18, 26] }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateSensorData();
      setCurrentData(newData);
      
      setHistoricalData(prev => {
        const updated = [...prev, newData].slice(-20); // Keep last 20 readings
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Health status calculation
  const getPlantHealth = () => {
    const profile = plantProfiles[selectedPlant];
    const moistureOk = currentData.soilMoisture >= profile.moistureRange[0] && 
                      currentData.soilMoisture <= profile.moistureRange[1];
    const tempOk = currentData.temperature >= profile.tempRange[0] && 
                   currentData.temperature <= profile.tempRange[1];
    
    if (moistureOk && tempOk) return { status: 'Excellent', color: 'text-green-500', bg: 'bg-green-100' };
    if (moistureOk || tempOk) return { status: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { status: 'Needs Attention', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const health = getPlantHealth();

  // Alert system
  const getAlerts = () => {
    const alerts = [];
    if (currentData.soilMoisture < 25) alerts.push('Low soil moisture - watering needed');
    if (currentData.temperature > 30) alerts.push('High temperature detected');
    if (currentData.lightLevel < 250) alerts.push('Insufficient light levels');
    return alerts;
  };

  const alerts = getAlerts();

  // Report generation functions
  const generateCSVExport = () => {
    const csvData = historicalData.map(data => ({
      'Timestamp': data.timestamp,
      'Plant': selectedPlant,
      'Soil Moisture (%)': data.soilMoisture,
      'Temperature (°C)': data.temperature,
      'Light Level (lux)': data.lightLevel,
      'pH Level': data.ph,
      'Humidity (%)': data.humidity
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
    XLSX.writeFile(wb, `PlantPulse_Data_${selectedPlant.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    setShowReportModal(false);
  };

  const generateExcelReport = () => {
    const reportData = {
      'Plant Information': [
        { Field: 'Plant Name', Value: selectedPlant },
        { Field: 'Health Status', Value: health.status },
        { Field: 'Report Generated', Value: new Date().toLocaleString() },
        { Field: 'Current Moisture', Value: `${currentData.soilMoisture}%` },
        { Field: 'Current Temperature', Value: `${currentData.temperature}°C` },
        { Field: 'Current Light Level', Value: `${currentData.lightLevel} lux` },
        { Field: 'pH Level', Value: currentData.ph },
        { Field: 'Humidity', Value: `${currentData.humidity}%` }
      ],
      'Historical Data': historicalData.map(data => ({
        Time: data.timestamp,
        'Moisture (%)': data.soilMoisture,
        'Temperature (°C)': data.temperature,
        'Light (lux)': data.lightLevel,
        'pH': data.ph,
        'Humidity (%)': data.humidity
      })),
      'Alerts': alerts.length > 0 ? alerts.map((alert, index) => ({
        'Alert #': index + 1,
        'Description': alert,
        'Time': currentData.timestamp
      })) : [{ 'Status': 'No alerts - All systems normal' }],
      'Plant Profile': [
        { Parameter: 'Optimal Moisture Range', Value: `${plantProfiles[selectedPlant].moistureRange[0]}% - ${plantProfiles[selectedPlant].moistureRange[1]}%` },
        { Parameter: 'Optimal Temperature Range', Value: `${plantProfiles[selectedPlant].tempRange[0]}°C - ${plantProfiles[selectedPlant].tempRange[1]}°C` }
      ]
    };

    const wb = XLSX.utils.book_new();
    
    (Object.keys(reportData) as (keyof typeof reportData)[]).forEach(sheetName => {
      const ws = XLSX.utils.json_to_sheet(reportData[sheetName]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName as string);
    });

    XLSX.writeFile(wb, `PlantPulse_Report_${selectedPlant.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowReportModal(false);
  };

  const generatePDFReport = () => {
    const reportContent = `
PlantPulse IoT System - Plant Monitoring Report

======================================
PLANT INFORMATION
======================================
Plant Name: ${selectedPlant}
Health Status: ${health.status}
Report Generated: ${new Date().toLocaleString()}

======================================
CURRENT READINGS
======================================
Soil Moisture: ${currentData.soilMoisture}%
Temperature: ${currentData.temperature}°C
Light Level: ${currentData.lightLevel} lux
pH Level: ${currentData.ph}
Humidity: ${currentData.humidity}%

======================================
PLANT PROFILE
======================================
Optimal Moisture Range: ${plantProfiles[selectedPlant].moistureRange[0]}% - ${plantProfiles[selectedPlant].moistureRange[1]}%
Optimal Temperature Range: ${plantProfiles[selectedPlant].tempRange[0]}°C - ${plantProfiles[selectedPlant].tempRange[1]}°C

======================================
RECENT READINGS (Last ${historicalData.length} measurements)
======================================
${historicalData.map(data => 
  `${data.timestamp} | Moisture: ${data.soilMoisture}% | Temp: ${data.temperature}°C | Light: ${data.lightLevel} lux`
).join('\n')}

======================================
ALERTS
======================================
${alerts.length > 0 ? alerts.map((alert, index) => `${index + 1}. ${alert}`).join('\n') : 'No alerts - All systems normal'}

======================================
RECOMMENDATIONS
======================================
${currentData.soilMoisture < plantProfiles[selectedPlant].moistureRange[0] ? '• Increase watering frequency\n' : ''}${currentData.soilMoisture > plantProfiles[selectedPlant].moistureRange[1] ? '• Reduce watering frequency\n' : ''}${currentData.temperature < plantProfiles[selectedPlant].tempRange[0] ? '• Consider moving to a warmer location\n' : ''}${currentData.temperature > plantProfiles[selectedPlant].tempRange[1] ? '• Consider moving to a cooler location\n' : ''}${currentData.lightLevel < 300 ? '• Increase light exposure\n' : ''}${alerts.length === 0 ? '• Plant conditions are optimal, continue current care routine' : ''}

Generated by PlantPulse IoT System
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlantPulse_Report_${selectedPlant.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowReportModal(false);
  };

  const generateInAppReport = () => {
    setShowReportModal(false);
    // This would typically navigate to a report page or show an in-app report
    alert('In-app report view would be implemented here. For now, this is a placeholder.');
  };

  // Chart data preparation
  const pieData = [
    { name: 'Optimal', value: 65, fill: '#10B981' },
    { name: 'Warning', value: 25, fill: '#F59E0B' },
    { name: 'Critical', value: 10, fill: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">PlantPulse</h1>
              <p className="text-gray-600">Smart IoT Soil Monitoring System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Battery className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">87%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Selection & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Plant Profile</h3>
            <select 
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value as PlantName)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {Object.keys(plantProfiles).map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
            <div className={`mt-4 p-3 rounded-lg ${health.bg}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${health.color.replace('text', 'bg')}`}></div>
                <span className={`font-medium ${health.color}`}>{health.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Readings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Moisture</span>
                </div>
                <span className="font-semibold">{currentData.soilMoisture}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className="font-semibold">{currentData.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Light</span>
                </div>
                <span className="font-semibold">{currentData.lightLevel} lux</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Alerts</h3>
            <div className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span className="text-sm text-yellow-700">{alert}</span>
                  </div>
                ))
              ) : (
                <div className="text-green-600 text-sm">All systems normal ✓</div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Soil Moisture Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="soilMoisture" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Temperature Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="temperature" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Plant Health Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors">
                Schedule Watering
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors">
                Update Plant Profile
              </button>
              
              {/* Combined Report/Export Button */}
              <button 
                onClick={() => setShowReportModal(true)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Choose Report Format</h3>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={generateExcelReport}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Excel Report (Detailed)</span>
                  </button>
                  
                  <button 
                    onClick={generateCSVExport}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV Data Export (Raw)</span>
                  </button>
                  
                  <button 
                    onClick={generatePDFReport}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Text Report (PDF-like)</span>
                  </button>
                  
                  <button 
                    onClick={generateInAppReport}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sun className="w-4 h-4" />
                    <span>View Report (In-App)</span>
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Excel Report:</strong> Comprehensive analysis with charts<br />
                    <strong>CSV Export:</strong> Raw sensor data for analysis<br />
                    <strong>Text Report:</strong> Formatted summary for sharing<br />
                    <strong>In-App View:</strong> Interactive report within the app
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>PlantPulse IoT System - Real-time Plant Monitoring</p>
          <p className="text-sm">Last updated: {currentData.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default PlantPulseDashboard;