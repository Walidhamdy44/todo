# Voice Input Feature Documentation

## Overview

The Voice Input feature enables users to create and edit tasks, courses, reading items, and goals using speech recognition. The implementation leverages the Web Speech API to provide real-time transcription with support for both English and Arabic languages.

## Features

### Core Capabilities

- **Real-time Transcription** - Live feedback as you speak with interim results displayed in real-time
- **Bilingual Support** - Full support for English and Arabic with automatic language detection
- **RTL Text Handling** - Proper right-to-left text rendering for Arabic input
- **Language Toggle** - Easy switching between English and Arabic via language badge button
- **Auto-stop Functionality** - Automatically stops recording after 10 seconds of silence
- **Visual Feedback** - Pulsing red microphone animation during active listening
- **Error Handling** - User-friendly error messages for various failure scenarios
- **Browser Compatibility** - Graceful fallback for unsupported browsers

### Integrated Locations

Voice input is available in the following forms:

| Page | Fields with Voice Input |
|------|------------------------|
| **Tasks** | Title, Description, Category |
| **Courses** | Name, Notes |
| **Reading Items** | Title, Source, Tags |
| **Goals** | Title, Description, Milestones |

## Implementation Structure

### Files Created

```
/hooks/
  └── useSpeechRecognition.ts      # Main hook managing Web Speech API

/components/
  ├── ui/
  │   └── VoiceInput.tsx            # Standalone voice UI component
  └── forms/
      └── VoiceEnabledInput.tsx     # Wrapper components for input/textarea

/lib/
  └── speech-utils.ts              # Utility functions for speech processing
```

## Usage Guide

### Using VoiceEnabledInput

The simplest way to add voice input to a text field:

```tsx
import { VoiceEnabledInput } from '@/components/forms/VoiceEnabledInput';

export function MyForm() {
  const [value, setValue] = useState('');

  return (
    <VoiceEnabledInput
      label="Task Title"
      placeholder="Enter task title or speak..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      voiceEnabled={true}
    />
  );
}
```

### Using VoiceEnabledTextarea

For longer text input with voice support:

```tsx
import { VoiceEnabledTextarea } from '@/components/forms/VoiceEnabledInput';

export function MyForm() {
  const [description, setDescription] = useState('');

  return (
    <VoiceEnabledTextarea
      label="Description"
      placeholder="Enter description or speak..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      voiceEnabled={true}
    />
  );
}
```

### Using useSpeechRecognition Hook Directly

For advanced use cases, you can use the hook directly:

```tsx
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export function CustomVoiceComponent() {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    language,
    startListening,
    stopListening,
    setLanguage,
    resetTranscript,
    browserSupported
  } = useSpeechRecognition();

  if (!browserSupported) {
    return <p>Voice input is not supported in your browser</p>;
  }

  return (
    <div>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      
      <p>Listening: {isListening ? 'Yes' : 'No'}</p>
      <p>Final: {transcript}</p>
      <p>Interim: {interimTranscript}</p>
      <p>Language: {language}</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## API Reference

### useSpeechRecognition Hook

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `isListening` | `boolean` | Whether the microphone is currently active |
| `transcript` | `string` | Final recognized text |
| `interimTranscript` | `string` | Temporary text being recognized in real-time |
| `error` | `string \| null` | Error message if transcription failed |
| `language` | `'en-US' \| 'ar-SA'` | Currently selected language |
| `browserSupported` | `boolean` | Whether browser supports Web Speech API |

#### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `startListening()` | none | Begin voice recognition |
| `stopListening()` | none | Stop voice recognition |
| `setLanguage()` | `lang: 'en-US' \| 'ar-SA'` | Switch language |
| `resetTranscript()` | none | Clear transcript and interim text |

### VoiceInput Component Props

```typescript
interface VoiceInputProps {
  onTranscript?: (text: string) => void;  // Callback when speech ends
  onInterim?: (text: string) => void;      // Callback for interim results
  onError?: (error: string) => void;       // Callback for errors
  initialLanguage?: 'en-US' | 'ar-SA';    // Starting language
  showLanguageToggle?: boolean;            // Show EN/AR badge (default: true)
  showTranscript?: boolean;                // Show interim text (default: true)
}
```

### VoiceEnabledInput Component Props

```typescript
interface VoiceEnabledInputProps 
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;                  // Field label
  voiceEnabled?: boolean;          // Enable voice input (default: true)
  showLanguageToggle?: boolean;    // Show language toggle
  error?: string;                  // Error message
}
```

## Language Support

### English (en-US)

- Default language for the application
- Uses SpeechRecognition with `lang: 'en-US'`
- Standard LTR (left-to-right) text rendering

### Arabic (ar-SA)

- Full support with proper RTL (right-to-left) rendering
- Uses SpeechRecognition with `lang: 'ar-SA'`
- Automatic text direction detection in input fields
- Detected by checking for Arabic Unicode characters (U+0600 to U+06FF)

### Switching Languages

Users can toggle between English and Arabic using the language badge button in the VoiceInput component. The selected language persists during the session.

```
┌─────────────────────────────┐
│  Task Title              EN↔AR │  ← Click to toggle
│ ┌─────────────────────────┐   │
│ │ 🎙️ Listening...        │   │
│ └─────────────────────────┘   │
└─────────────────────────────┘
```

## Error Handling

The feature handles various error scenarios gracefully:

| Error | Cause | Handling |
|-------|-------|----------|
| `not-allowed` | Microphone permission denied | Shows friendly message, suggests enabling permissions |
| `network-error` | Internet connection issue | Displays network error message |
| `no-speech` | No speech detected in timeout period | Automatically stops and shows message |
| `not-supported` | Browser doesn't support Web Speech API | Voice button hidden from UI |

## Browser Compatibility

### Supported Browsers

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Best performance |
| Firefox | ✅ Full | Full support |
| Safari | ⚠️ Limited | iOS Safari may have restrictions |
| Opera | ✅ Full | Full support |
| Internet Explorer | ❌ Not supported | No fallback provided |

The feature gracefully degrades on unsupported browsers - the voice input button simply won't appear, and users can still type normally.

## Behavior Details

### Auto-stop Behavior

- Recording automatically stops after **10 seconds of silence**
- Silence is detected by the browser's Web Speech API
- The `transcript` state is updated when recording stops
- User is notified when recording stops

### Interim Results

- Displayed in real-time as you speak
- Shown in a lighter color/opacity to distinguish from final text
- Clears when recording stops
- Not added to the input field until recording is complete

### Text Append Behavior

When voice recognition completes:
- If input field is empty: speech text is placed in the field
- If input field has text: speech text is appended with a space
- User can edit the result immediately

## Advanced Features

### Custom Error Handling

```tsx
<VoiceEnabledInput
  label="Task"
  value={task}
  onChange={(e) => setTask(e.target.value)}
  voiceEnabled={true}
/>
```

### Language Persistence

Language selection is maintained per component instance during the session. To persist across sessions, store the preference in localStorage or user preferences.

### Combining with Form Validation

```tsx
const [title, setTitle] = useState('');
const [error, setError] = useState('');

<VoiceEnabledInput
  label="Task Title"
  value={title}
  onChange={(e) => {
    setTitle(e.target.value);
    // Custom validation
    if (e.target.value.length === 0) {
      setError('Title is required');
    } else {
      setError('');
    }
  }}
  error={error}
  voiceEnabled={true}
/>
```

## Accessibility

- **ARIA Labels**: All voice buttons have proper `aria-label` attributes
- **Keyboard Support**: Voice buttons are keyboard accessible with Tab and Enter
- **Screen Readers**: Status messages announced to screen readers
- **Visual Feedback**: Pulsing animation and color changes indicate state
- **Color Contrast**: Buttons meet WCAG AA contrast standards

## Troubleshooting

### Voice Input Button Not Appearing

**Problem**: The microphone button is not visible
- **Solution 1**: Check browser compatibility (see Browser Compatibility section)
- **Solution 2**: Verify `voiceEnabled={true}` is set on the component
- **Solution 3**: Check browser console for errors

### Permission Denied Error

**Problem**: "Permission denied" message appears when clicking mic button
- **Solution 1**: Check browser microphone permissions settings
- **Solution 2**: For Chrome: Settings → Privacy → Microphone → Check site is allowed
- **Solution 3**: For Firefox: Preferences → Privacy & Security → Microphone → Check site is allowed
- **Solution 4**: Reload the page after enabling permissions

### Not Detecting Speech

**Problem**: Microphone is active but not recognizing words
- **Solution 1**: Speak clearly and at normal pace
- **Solution 2**: Check for background noise
- **Solution 3**: Try a different language setting
- **Solution 4**: Verify microphone hardware is working (test in another app)

### Text Not Appearing in Input

**Problem**: Speech recognized but text doesn't appear
- **Solution 1**: Check if `onChange` handler is properly connected
- **Solution 2**: Verify input field is not in read-only mode
- **Solution 3**: Check browser console for JavaScript errors
- **Solution 4**: Try reloading the page

### Wrong Language Detected

**Problem**: Arabic input recognized as English or vice versa
- **Solution 1**: Use the language toggle badge to manually select correct language
- **Solution 2**: The language will remain selected for future inputs in that field
- **Solution 3**: Ensure you're speaking clearly in the selected language

## Performance Considerations

- **Memory**: Transcript data is stored in component state, cleared on unmount
- **CPU**: Web Speech API uses minimal CPU, mostly offloaded to system
- **Network**: Only required for streaming recognition (depends on browser/OS)
- **Battery**: Microphone usage affects battery on mobile devices

## Security & Privacy

- **No Cloud Recording**: Speech is processed locally by browser when possible
- **Permissions**: Users must grant explicit microphone permission
- **Data Flow**: Transcript data never sent to backend unless explicitly submitted in forms
- **Browser Storage**: No persistent storage of voice data

## Future Enhancements

Potential improvements for future versions:

- [ ] Custom silence detection threshold
- [ ] Confidence score display for recognized text
- [ ] Multiple simultaneous language support
- [ ] Voice commands (e.g., "delete", "submit")
- [ ] Punctuation prediction
- [ ] User-defined vocabulary/dictionary
- [ ] Analytics on voice input usage
- [ ] Voice playback of recognized text

## Support & Feedback

For issues or feature requests related to the voice input feature:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify browser and microphone hardware compatibility
4. Test in a different browser if available
5. Submit detailed bug reports including browser version and error messages

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release with English and Arabic support |

---

**Last Updated**: January 30, 2026
