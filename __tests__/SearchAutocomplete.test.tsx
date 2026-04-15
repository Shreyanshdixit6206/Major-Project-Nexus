import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchAutocomplete from '@/components/SearchAutocomplete';

// Mock the global fetch
global.fetch = jest.fn();

describe('SearchAutocomplete Component', () => {
  const onSearchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field correctly', () => {
    render(<SearchAutocomplete onSearch={onSearchMock} />);
    const input = screen.getByPlaceholderText(/Search by generic/i);
    expect(input).toBeInTheDocument();
  });

  it('fetches suggestions when user inputs 2+ characters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        suggestions: [
          { text: 'Paracetamol 500mg', source: 'PMBJP' },
          { text: 'Paracet', source: 'A_Z' }
        ]
      })
    });

    render(<SearchAutocomplete onSearch={onSearchMock} />);
    const input = screen.getByPlaceholderText(/Search by generic/i);
    
    fireEvent.change(input, { target: { value: 'Par' } });
    
    // Wait for the debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/suggestions?q=Par');
    }, { timeout: 500 });
    
    // Check if dropdown appears
    const suggestion1 = await screen.findByText('Paracetamol 500mg');
    expect(suggestion1).toBeInTheDocument();
  });

  it('selects a suggestion and calls onSearch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        suggestions: [
          { text: 'Aspirin Match', source: 'PMBJP' }
        ]
      })
    });

    render(<SearchAutocomplete onSearch={onSearchMock} />);
    const input = screen.getByPlaceholderText(/Search by generic/i);
    fireEvent.change(input, { target: { value: 'Asp' } });
    
    const suggestion = await screen.findByText('Aspirin Match');
    fireEvent.click(suggestion);
    
    expect(onSearchMock).toHaveBeenCalledWith('Aspirin Match');
    // Dropdown should be closed and the value should be Aspirin Match
    expect(input).toHaveValue('Aspirin Match');
  });
});
