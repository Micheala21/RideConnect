import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

const AuthInput = ({
  label,
  error,
  ...textInputProps
}: AuthInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          error ? styles.inputError : null,
        ]}
      />

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },

  inputError: {
    borderColor: '#DC2626',
  },

  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 5,
  },
});

export default AuthInput;