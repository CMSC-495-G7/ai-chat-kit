import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  networkArgTypes,
  useSimulatedResponder,
  type NetworkCondition,
} from '../shared/simulatedNetwork'
import App from './full-chat-app'

// The full chat app, rendered as-is: sidebar, top bar, conversation, reference
// pane, settings dialogs — everything the library looks like assembled into a
// product. It streams from the canned turns unless it is given a responder,
// which is how the network stories below put a simulated server behind it.
const meta = {
  title: 'Chat/Recipes/Full chat app',
  component: App,
  // The sidebar links back to the demos, so it needs a router like any route.
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

function OverTheWire({ network }: { network: NetworkCondition }) {
  return <App responder={useSimulatedResponder(network)} />
}

type NetworkStory = StoryObj<Meta<typeof OverTheWire>>

const overTheWire = {
  render: (args) => <OverTheWire {...args} />,
  argTypes: networkArgTypes,
} satisfies NetworkStory

/**
 * The whole app over the WebSocket responder and a simulated server. Ask about
 * the “market” to see tool calls in the trace; switch `network` in Controls to
 * change the connection under a conversation already in progress.
 */
export const SimulatedNetwork: NetworkStory = { ...overTheWire, args: { network: 'healthy' } }

/** Every connection is refused: the turn fails in place and Retry fails again. */
export const ServerUnreachable: NetworkStory = { ...overTheWire, args: { network: 'offline' } }
