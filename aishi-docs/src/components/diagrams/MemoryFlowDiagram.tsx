/**
 * @fileoverview Interactive Memory Flow Diagram using React Flow
 * @description Shows hierarchical memory consolidation from daily interactions to yearly wisdom
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'

// Type definition for memory node
type MemoryNodeType = Node<{
  label: string
  subtitle: string
  logo?: string
  defaultLogo?: string
  active?: boolean
  color?: string
  borderColor?: string
  textColor?: string
  fileType?: string
}, 'memory'>

const CustomMemoryNode = ({ data }: NodeProps<MemoryNodeType>) => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getLogoSrc = () => {
    if (!mounted) return data.defaultLogo || '/logo_white.png'
    
    if (data.logo === 'aishi') {
      return theme === 'dark' ? '/logo_white.png' : '/logo_black.png'
    } else {
      // 0G logo: Dark.svg has white logo, Light.svg has black logo
      return theme === 'dark' ? '/0G-Logo-Dark.svg' : '/0G-Logo-Light.svg'
    }
  }

  const bgColor = data.active 
    ? `${data.color}/20 border-2 ${data.borderColor}` 
    : 'bg-background-card border border-border'
  
  const textColor = data.active ? data.textColor : 'text-text-secondary'

  return (
    <div className={`px-3 py-2 md:px-4 md:py-3 rounded-lg transition-all duration-300 ${bgColor} min-w-[140px] md:min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className="!bg-accent-primary" />
      
      {data.logo ? (
        <div className="flex items-center justify-start space-x-2">
          <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
            <Image
              src={getLogoSrc()}
              alt={data.label}
              width={32}
              height={32}
              className={data.logo === 'aishi' ? 'rounded' : ''}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-xs md:text-sm text-text-primary mb-1">{data.label}</div>
            <div className={`text-xs ${textColor} font-medium`}>{data.subtitle}</div>
            {data.fileType && (
              <div className="text-xs text-text-tertiary mt-1 font-mono">{data.fileType}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="font-semibold text-xs md:text-sm text-text-primary mb-1">{data.label}</div>
          <div className={`text-xs ${textColor} font-medium`}>{data.subtitle}</div>
          {data.fileType && (
            <div className="text-xs text-text-tertiary mt-1 font-mono">{data.fileType}</div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-accent-primary" />
    </div>
  )
}

const nodeTypes = {
  memory: CustomMemoryNode
}

const generateMemoryNodes = (viewportWidth: number): MemoryNodeType[] => {
  const isMobile = viewportWidth < 768
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024
  
  const centerX = isMobile ? 160 : isTablet ? 200 : 300
  const leftX = isMobile ? 80 : isTablet ? 120 : 150
  const rightX = isMobile ? 240 : isTablet ? 280 : 450
  const stepY = isMobile ? 100 : isTablet ? 120 : 140

  return [
    // Daily Interactions
    {
      id: '1',
      type: 'memory',
      position: { x: leftX, y: 0 },
      data: { 
        label: 'Dream Input', 
        subtitle: 'Raw dream data',
        color: 'bg-purple-500',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-600'
      }
    },
    {
      id: '2', 
      type: 'memory',
      position: { x: rightX, y: 0 },
      data: { 
        label: 'Chat Input', 
        subtitle: 'Conversation data',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500', 
        textColor: 'text-blue-600'
      }
    },
    
    // Daily Storage
    {
      id: '3',
      type: 'memory',
      position: { x: leftX, y: stepY },
      data: { 
        label: 'Daily Dreams', 
        subtitle: 'Short-Term Memory',
        fileType: 'dreams_daily.json',
        color: 'bg-purple-400',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-500'
      }
    },
    {
      id: '4',
      type: 'memory', 
      position: { x: rightX, y: stepY },
      data: { 
        label: 'Daily Conversations', 
        subtitle: 'Short-Term Memory',
        fileType: 'conversations_daily.json',
        color: 'bg-blue-400',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-500'
      }
    },

    // AI Brain Processing
    {
      id: '5',
      type: 'memory',
      position: { x: centerX, y: stepY * 2 },
      data: { 
        label: '0G Compute', 
        subtitle: 'Pattern Analysis',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-600'
      }
    },
    
    // Monthly Consolidation
    {
      id: '6',
      type: 'memory',
      position: { x: leftX, y: stepY * 3 },
      data: { 
        label: 'Monthly Dreams', 
        subtitle: 'Mid-Term Memory',
        fileType: 'dreams_monthly.json',
        color: 'bg-purple-600',
        borderColor: 'border-purple-600',
        textColor: 'text-purple-700'
      }
    },
    {
      id: '7',
      type: 'memory',
      position: { x: rightX, y: stepY * 3 },
      data: { 
        label: 'Monthly Conversations', 
        subtitle: 'Mid-Term Memory', 
        fileType: 'conversation_monthly.json',
        color: 'bg-blue-600',
        borderColor: 'border-blue-600',
        textColor: 'text-blue-700'
      }
    },

    // Second AI Brain Processing (Yearly)
    {
      id: '8',
      type: 'memory',
      position: { x: centerX, y: stepY * 4 },
      data: { 
        label: '0G Compute', 
        subtitle: 'Yearly Synthesis',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-600'
      }
    },

    // Yearly Core
    {
      id: '9',
      type: 'memory',
      position: { x: centerX, y: stepY * 5 },
      data: { 
        label: 'Memory Core', 
        subtitle: 'Long-Term Wisdom',
        fileType: 'memory_core_yearly.json',
        color: 'bg-purple-600',
        borderColor: 'border-purple-600',
        textColor: 'text-purple-400'
      }
    }
  ]
}

const memoryFlowEdges: Edge[] = [
  // Daily inputs to daily storage
  { id: 'e1-3', source: '1', target: '3', animated: true, type: 'smoothstep' },
  { id: 'e2-4', source: '2', target: '4', animated: true, type: 'smoothstep' },
  
  // Daily storage to AI processing
  { id: 'e3-5', source: '3', target: '5', animated: true, type: 'smoothstep' },
  { id: 'e4-5', source: '4', target: '5', animated: true, type: 'smoothstep' },
  
  // AI processing to monthly consolidation
  { id: 'e5-6', source: '5', target: '6', animated: true, type: 'smoothstep' },
  { id: 'e5-7', source: '5', target: '7', animated: true, type: 'smoothstep' },
  
  // Monthly to second AI brain
  { id: 'e6-8', source: '6', target: '8', animated: true, type: 'smoothstep' },
  { id: 'e7-8', source: '7', target: '8', animated: true, type: 'smoothstep' },
  
  // Second AI brain to yearly core
  { id: 'e8-9', source: '8', target: '9', animated: true, type: 'smoothstep' }
]

export const MemoryFlowDiagram: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [viewportWidth, setViewportWidth] = useState(800)
  const [nodes, setNodes, onNodesChange] = useNodesState(generateMemoryNodes(800))
  const [edges, , onEdgesChange] = useEdgesState(memoryFlowEdges)
  const [activeStep, setActiveStep] = useState(0)
  const { theme } = useTheme()

  const handleResize = useCallback(() => {
    const width = window.innerWidth
    setViewportWidth(width)
    const newNodes = generateMemoryNodes(width)
    setNodes(newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        active: parseInt(node.id) <= activeStep
      }
    })))
  }, [activeStep, setNodes])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useEffect(() => {
    const maxSteps = 9
    
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= maxSteps) return 0
        return prev + 1
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          active: parseInt(node.id) <= activeStep
        }
      }))
    )
  }, [activeStep, setNodes])

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-text-primary">The Flow of Consciousness</h4>
        <p className="text-sm text-text-secondary mt-1">From Daily Moments to Lasting Wisdom</p>
      </div>

      <div className="h-[400px] md:h-[500px] lg:h-[600px] bg-background-card rounded-xl border border-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          minZoom={0.4}
          maxZoom={1.5}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background 
            color={theme === 'dark' ? '#374151' : '#E5E7EB'}
            gap={20}
          />
          <Controls 
            showInteractive={false}
            className="!bg-background-card !border-border"
          />
        </ReactFlow>
      </div>

      <div className="mt-4 p-4 bg-background-card rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-text-primary">
              Step {activeStep} of 9
            </span>
            <span className="sm:ml-3 text-sm text-text-secondary">
              {getMemoryStepDescription(activeStep)}
            </span>
          </div>
          <div className="text-xs text-text-tertiary hidden sm:block">
            Hierarchical Memory • Infinite Recall
          </div>
        </div>
      </div>
    </div>
  )
}

function getMemoryStepDescription(step: number): string {
  const descriptions = [
    'User shares dream or conversation',
    'Data flows to daily storage files',
    'Raw interactions stored as JSON',
    'Daily logs accumulate over time',
    '0G Compute analyzes patterns monthly',
    'Monthly essence extracted and saved',
    'Conversations consolidated monthly',
    '0G Compute performs yearly synthesis',
    'Yearly core crystallizes all wisdom'
  ]
  return descriptions[Math.min(step - 1, descriptions.length - 1)] || 'Processing memories...'
}

export default MemoryFlowDiagram