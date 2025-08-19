/**
 * @fileoverview Interactive Flow Diagram using React Flow
 * @description Shows actual data flow for dream and chat commands in the Living Digital Organism
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

// Custom Node Component
const CustomNode = ({ data }: NodeProps) => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getLogoSrc = () => {
    if (!mounted) return data.defaultLogo
    
    if (data.logo === 'aishi') {
      return theme === 'dark' ? '/logo_white.png' : '/logo_black.png'
    } else {
      // 0G logo: Dark.svg has white logo, Light.svg has black logo
      return theme === 'dark' ? '/0G-Logo-Dark.svg' : '/0G-Logo-Light.svg'
    }
  }

  const bgColor = data.active ? 'bg-accent-primary/10 border-accent-primary' : 'bg-background-card border-border'
  const textColor = data.active ? 'text-accent-primary' : 'text-text-secondary'

  return (
    <div className={`px-2 py-1 md:px-4 md:py-3 rounded-lg border-2 transition-all duration-300 ${bgColor} min-w-[160px] md:min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="!bg-accent-primary" />
      
      <div className="flex items-center justify-start space-x-3">
        {data.logo && (
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image
              src={getLogoSrc()}
              alt={data.label}
              width={32}
              height={32}
              className={data.logo === 'aishi' ? 'rounded' : ''}
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-xs md:text-sm text-text-primary">{data.label}</div>
          <div className={`text-xs ${textColor}`}>{data.subtitle}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent-primary" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode
}

// Function to generate responsive node positions based on viewport width
const generateResponsiveNodes = (viewportWidth: number): Node[] => {
  // Responsive positioning based on screen size
  const isMobile = viewportWidth < 768
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024
  
  const centerX = isMobile ? 160 : isTablet ? 200 : 300
  const leftX = isMobile ? 80 : isTablet ? 120 : 150
  const rightX = isMobile ? 240 : isTablet ? 280 : 450
  const stepY = isMobile ? 60 : isTablet ? 70 : 80

  return [
    {
      id: '1',
      type: 'custom',
      position: { x: centerX, y: 0 },
      data: { 
        label: 'aishiOS', 
        subtitle: 'Terminal interface',
        logo: 'aishi',
        defaultLogo: '/logo_white.png'
      }
    },
    {
      id: '2',
      type: 'custom',
      position: { x: leftX, y: stepY },
      data: { 
        label: '0G Chain', 
        subtitle: 'Fetch agent data',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '3',
      type: 'custom',
      position: { x: rightX, y: stepY * 2 },
      data: { 
        label: '0G iNFT', 
        subtitle: 'Soul & memory hashes',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '4',
      type: 'custom',
      position: { x: leftX, y: stepY * 3 },
      data: { 
        label: '0G Storage', 
        subtitle: 'Download memories',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '5',
      type: 'custom',
      position: { x: rightX, y: stepY * 4 },
      data: { 
        label: 'Build Prompt', 
        subtitle: 'Context assembly',
        logo: 'aishi',
        defaultLogo: '/logo_white.png'
      }
    },
    {
      id: '6',
      type: 'custom',
      position: { x: leftX, y: stepY * 5 },
      data: { 
        label: '0G Compute', 
        subtitle: 'AI analysis',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '7',
      type: 'custom',
      position: { x: rightX, y: stepY * 6 },
      data: { 
        label: 'Memory Manager', 
        subtitle: 'Process & update',
        logo: 'aishi',
        defaultLogo: '/logo_white.png'
      }
    },
    {
      id: '8',
      type: 'custom',
      position: { x: leftX, y: stepY * 7 },
      data: { 
        label: '0G Storage', 
        subtitle: 'Upload & get hash',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '9',
      type: 'custom',
      position: { x: rightX, y: stepY * 8 },
      data: { 
        label: 'Update iNFT', 
        subtitle: 'Save hash in contract',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    },
    {
      id: '10',
      type: 'custom',
      position: { x: centerX, y: stepY * 9 },
      data: { 
        label: '0G DA', 
        subtitle: 'Verify integrity',
        logo: '0g',
        defaultLogo: '/0G-Logo-Dark.svg'
      }
    }
  ]
}

// Unified Flow Edges - linear flow
const unifiedFlowEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', animated: true, type: 'smoothstep' },
  { id: 'e4-5', source: '4', target: '5', animated: true, type: 'smoothstep' },
  { id: 'e5-6', source: '5', target: '6', animated: true, type: 'smoothstep' },
  { id: 'e6-7', source: '6', target: '7', animated: true, type: 'smoothstep' },
  { id: 'e7-8', source: '7', target: '8', animated: true, type: 'smoothstep' },
  { id: 'e8-9', source: '8', target: '9', animated: true, type: 'smoothstep' },
  { id: 'e9-10', source: '9', target: '10', animated: true, type: 'smoothstep' }
]

export const FlowDiagram: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [viewportWidth, setViewportWidth] = useState(800)
  const [nodes, setNodes, onNodesChange] = useNodesState(generateResponsiveNodes(800))
  const [edges, , onEdgesChange] = useEdgesState(unifiedFlowEdges)
  const [activeStep, setActiveStep] = useState(0)
  const { theme } = useTheme()

  // Handle window resize for responsive positioning
  const handleResize = useCallback(() => {
    const width = window.innerWidth
    setViewportWidth(width)
    const newNodes = generateResponsiveNodes(width)
    setNodes(newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        active: parseInt(node.id) <= activeStep
      }
    })))
  }, [activeStep, setNodes])

  // Setup resize listener
  useEffect(() => {
    // Initial setup
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Animate steps
  useEffect(() => {
    const maxSteps = 10
    
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= maxSteps) return 0
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Update node active state
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
      {/* Title */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-text-primary">Living Digital Organism Data Flow</h4>
        <p className="text-sm text-text-secondary mt-1">Watch how commands flow through the system</p>
      </div>

      {/* Flow Diagram */}
      <div className="h-[500px] md:h-[600px] lg:h-[800px] bg-background-card rounded-xl border border-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={1.5}
          panOnScroll={false}
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

      {/* Step Description */}
      <div className="mt-4 p-4 bg-background-card rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-text-primary">
              Step {activeStep} of 10
            </span>
            <span className="sm:ml-3 text-sm text-text-secondary">
              {getStepDescription(activeStep)}
            </span>
          </div>
          <div className="text-xs text-text-tertiary hidden sm:block">
            Powered by 0G Network • iNFT by 0G Labs
          </div>
        </div>
      </div>
    </div>
  )
}

function getStepDescription(step: number): string {
  const descriptions = [
    'User inputs command in aishiOS terminal',
    'Fetch agent data from 0G Chain',
    'Access iNFT soul and memory hashes',
    'Download memories from 0G Storage',
    'Build comprehensive prompt with context',
    'Send to 0G Compute for AI analysis',
    'Process data in Memory Manager',
    'Upload updated data to 0G Storage',
    'Update iNFT contract with new hash',
    'Verify integrity through 0G DA layer'
  ]
  return descriptions[Math.min(step - 1, descriptions.length - 1)] || 'Processing...'
}

export default FlowDiagram