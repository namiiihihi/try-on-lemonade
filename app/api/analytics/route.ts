import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type EventType = 'shade_selected' | 'photo_captured' | 'add_to_cart' | 'share'

type EventPayload = {
  session_id: string
  product_id: string
  event_type: EventType
}

const VALID_EVENT_TYPES: EventType[] = ['shade_selected', 'photo_captured', 'add_to_cart', 'share']

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<EventPayload>
    const { session_id, product_id, event_type } = body

    if (!session_id || !product_id || !event_type) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: session_id, product_id, event_type' },
        { status: 400 }
      )
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        { data: null, error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    )

    const { data, error } = await supabase
      .from('try_on_events')
      .insert({ session_id, product_id, event_type })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
