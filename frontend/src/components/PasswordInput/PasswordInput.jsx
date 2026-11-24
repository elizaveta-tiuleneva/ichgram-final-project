import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import styles from './PasswordInput.module.scss';

function PasswordInput(props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        {...props}
        type={showPassword ? 'text' : 'password'}
      />

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShowPassword((previous) => !previous)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <EyeOff size={18} strokeWidth={1.5} />
        ) : (
          <Eye size={18} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;