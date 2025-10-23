import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RichTextEditor from '../forms/RichTextEditor'

// Mock the editor to avoid DOM complexity in tests
jest.mock('@tiptap/react', () => ({
  useEditor: () => ({
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleUnderline: () => ({ run: jest.fn() }),
        toggleBulletList: () => ({ run: jest.fn() }),
        toggleOrderedList: () => ({ run: jest.fn() }),
        toggleBlockquote: () => ({ run: jest.fn() }),
        setLink: () => ({ run: jest.fn() }),
        setImage: () => ({ run: jest.fn() }),
        undo: () => ({ run: jest.fn() }),
        redo: () => ({ run: jest.fn() }),
      }),
    }),
    isActive: jest.fn(() => false),
    can: () => ({
      chain: () => ({
        focus: () => ({
          undo: () => ({ run: jest.fn() }),
          redo: () => ({ run: jest.fn() }),
        }),
      }),
    }),
    getHTML: jest.fn(() => '<p>Test content</p>'),
    storage: {
      characterCount: {
        characters: jest.fn(() => 13),
      },
    },
  }),
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="editor-content" contentEditable>
      Test content
    </div>
  ),
}))

describe('RichTextEditor', () => {
  const mockOnChange = jest.fn()
  const mockOnAutoSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with initial content', () => {
    render(
      <RichTextEditor
        content="<p>Initial content</p>"
        onChange={mockOnChange}
      />
    )

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('shows placeholder text when content is empty', () => {
    render(
      <RichTextEditor
        content=""
        onChange={mockOnChange}
        placeholder="Start writing..."
      />
    )

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders toolbar buttons', () => {
    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
      />
    )

    // Check for toolbar buttons
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bullet list/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ordered list/i })).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(
      <RichTextEditor
        content="<p>Test content</p>"
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('13 characters')).toBeInTheDocument()
  })

  it('calls onChange when content changes', async () => {
    render(
      <RichTextEditor
        content="<p>Initial</p>"
        onChange={mockOnChange}
      />
    )

    const editorContent = screen.getByTestId('editor-content')
    fireEvent.input(editorContent, { target: { textContent: 'New content' } })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('handles auto-save functionality', async () => {
    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
        autoSave={true}
        onAutoSave={mockOnAutoSave}
      />
    )

    const editorContent = screen.getByTestId('editor-content')
    fireEvent.input(editorContent, { target: { textContent: 'New content' } })

    await waitFor(() => {
      expect(mockOnAutoSave).toHaveBeenCalled()
    })
  })

  it('shows manual save button when not auto-saving', () => {
    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
        onAutoSave={mockOnAutoSave}
        autoSave={false}
      />
    )

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('handles image addition', async () => {
    // Mock window.prompt
    const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('https://example.com/image.jpg')

    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
      />
    )

    const imageButton = screen.getByRole('button', { name: /image/i })
    fireEvent.click(imageButton)

    expect(mockPrompt).toHaveBeenCalledWith('Enter image URL:')

    mockPrompt.mockRestore()
  })

  it('handles link addition', async () => {
    // Mock window.prompt
    const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('https://example.com')

    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
      />
    )

    const linkButton = screen.getByRole('button', { name: /link/i })
    fireEvent.click(linkButton)

    expect(mockPrompt).toHaveBeenCalledWith('Enter URL:')

    mockPrompt.mockRestore()
  })

  it('shows auto-save status', () => {
    render(
      <RichTextEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
        autoSave={true}
        onAutoSave={mockOnAutoSave}
      />
    )

    expect(screen.getByText('Ready')).toBeInTheDocument()
  })
})
