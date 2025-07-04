import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '~/utils/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    
    // Test service role client access to profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('[Health] Service role client test failed:', error)
      return NextResponse.json({ 
        status: 'error',
        error: `Service role client test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      status: 'healthy',
      serviceRoleClient: 'working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Health] Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 