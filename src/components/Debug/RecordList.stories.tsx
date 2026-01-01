import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DebugRecord } from './DebugScreen';
import { RecordList } from './RecordList';

const meta = {
  title: 'Debug/RecordList',
  component: RecordList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '記録一覧表示とJSONエクスポート機能。デバッグ記録を一覧表示し、JSONファイルとしてエクスポートできます。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '800px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordList>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOnClear = () => {
  console.log('Records cleared');
};

/**
 * 空の状態（記録なし）
 */
export const Empty: Story = {
  args: {
    records: [],
    canvasInfo: null,
    onClear: defaultOnClear,
  },
};

/**
 * 正解のみ（5件）
 */
export const AllCorrect: Story = {
  args: {
    records: [
      {
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        click: { screenX: 300, screenY: 100, physicalX: 0, physicalY: -103 },
        detected: { segment: 20, ring: 'TRIPLE', score: 60 },
        actual: { segment: 20, ring: 'TRIPLE' },
        isCorrect: true,
      },
      {
        id: 2,
        timestamp: '2024-01-01T10:01:00Z',
        click: { screenX: 450, screenY: 300, physicalX: 166, physicalY: 0 },
        detected: { segment: 16, ring: 'DOUBLE', score: 32 },
        actual: { segment: 16, ring: 'DOUBLE' },
        isCorrect: true,
      },
      {
        id: 3,
        timestamp: '2024-01-01T10:02:00Z',
        click: { screenX: 300, screenY: 300, physicalX: 0, physicalY: 0 },
        detected: { segment: 25, ring: 'INNER_BULL', score: 50 },
        actual: { segment: 25, ring: 'INNER_BULL' },
        isCorrect: true,
      },
      {
        id: 4,
        timestamp: '2024-01-01T10:03:00Z',
        click: { screenX: 350, screenY: 250, physicalX: 50, physicalY: -50 },
        detected: { segment: 5, ring: 'INNER_SINGLE', score: 5 },
        actual: { segment: 5, ring: 'INNER_SINGLE' },
        isCorrect: true,
      },
      {
        id: 5,
        timestamp: '2024-01-01T10:04:00Z',
        click: { screenX: 200, screenY: 300, physicalX: -100, physicalY: 0 },
        detected: { segment: 3, ring: 'OUTER_SINGLE', score: 3 },
        actual: { segment: 3, ring: 'OUTER_SINGLE' },
        isCorrect: true,
      },
    ] as DebugRecord[],
    canvasInfo: { width: 600, height: 600, scale: 2.5 },
    onClear: defaultOnClear,
  },
};

/**
 * 不正解のみ（3件）
 */
export const AllIncorrect: Story = {
  args: {
    records: [
      {
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        click: { screenX: 300, screenY: 100, physicalX: 0, physicalY: -103 },
        detected: { segment: 20, ring: 'TRIPLE', score: 60 },
        actual: { segment: 1, ring: 'TRIPLE' },
        isCorrect: false,
      },
      {
        id: 2,
        timestamp: '2024-01-01T10:01:00Z',
        click: { screenX: 450, screenY: 300, physicalX: 166, physicalY: 0 },
        detected: { segment: 16, ring: 'DOUBLE', score: 32 },
        actual: { segment: 8, ring: 'DOUBLE' },
        isCorrect: false,
      },
      {
        id: 3,
        timestamp: '2024-01-01T10:02:00Z',
        click: { screenX: 300, screenY: 300, physicalX: 0, physicalY: 0 },
        detected: { segment: 25, ring: 'OUTER_BULL', score: 25 },
        actual: { segment: 25, ring: 'INNER_BULL' },
        isCorrect: false,
      },
    ] as DebugRecord[],
    canvasInfo: { width: 600, height: 600, scale: 2.5 },
    onClear: defaultOnClear,
  },
};

/**
 * 混在（正解と不正解）
 */
export const Mixed: Story = {
  args: {
    records: [
      {
        id: 1,
        timestamp: '2024-01-01T10:00:00Z',
        click: { screenX: 300, screenY: 100, physicalX: 0, physicalY: -103 },
        detected: { segment: 20, ring: 'TRIPLE', score: 60 },
        actual: { segment: 20, ring: 'TRIPLE' },
        isCorrect: true,
      },
      {
        id: 2,
        timestamp: '2024-01-01T10:01:00Z',
        click: { screenX: 450, screenY: 300, physicalX: 166, physicalY: 0 },
        detected: { segment: 16, ring: 'DOUBLE', score: 32 },
        actual: { segment: 8, ring: 'DOUBLE' },
        isCorrect: false,
      },
      {
        id: 3,
        timestamp: '2024-01-01T10:02:00Z',
        click: { screenX: 300, screenY: 300, physicalX: 0, physicalY: 0 },
        detected: { segment: 25, ring: 'INNER_BULL', score: 50 },
        actual: { segment: 25, ring: 'INNER_BULL' },
        isCorrect: true,
      },
      {
        id: 4,
        timestamp: '2024-01-01T10:03:00Z',
        click: { screenX: 350, screenY: 250, physicalX: 50, physicalY: -50 },
        detected: { segment: 5, ring: 'INNER_SINGLE', score: 5 },
        actual: { segment: 12, ring: 'INNER_SINGLE' },
        isCorrect: false,
      },
      {
        id: 5,
        timestamp: '2024-01-01T10:04:00Z',
        click: { screenX: 200, screenY: 300, physicalX: -100, physicalY: 0 },
        detected: { segment: 3, ring: 'OUTER_SINGLE', score: 3 },
        actual: { segment: 3, ring: 'OUTER_SINGLE' },
        isCorrect: true,
      },
    ] as DebugRecord[],
    canvasInfo: { width: 600, height: 600, scale: 2.5 },
    onClear: defaultOnClear,
  },
};

/**
 * 多数の記録（15件）
 */
export const ManyRecords: Story = {
  args: {
    records: Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - (15 - i) * 60000).toISOString(),
      click: {
        screenX: 300 + Math.random() * 200,
        screenY: 200 + Math.random() * 200,
        physicalX: -100 + Math.random() * 200,
        physicalY: -100 + Math.random() * 200,
      },
      detected: {
        segment: Math.floor(Math.random() * 20) + 1,
        ring: ['TRIPLE', 'DOUBLE', 'INNER_SINGLE', 'OUTER_SINGLE'][Math.floor(Math.random() * 4)] as
          | 'TRIPLE'
          | 'DOUBLE'
          | 'INNER_SINGLE'
          | 'OUTER_SINGLE',
        score: Math.floor(Math.random() * 60) + 1,
      },
      actual: {
        segment: Math.floor(Math.random() * 20) + 1,
        ring: ['TRIPLE', 'DOUBLE', 'INNER_SINGLE', 'OUTER_SINGLE'][Math.floor(Math.random() * 4)] as
          | 'TRIPLE'
          | 'DOUBLE'
          | 'INNER_SINGLE'
          | 'OUTER_SINGLE',
      },
      isCorrect: Math.random() > 0.3,
    })) as DebugRecord[],
    canvasInfo: { width: 600, height: 600, scale: 2.5 },
    onClear: defaultOnClear,
  },
};
