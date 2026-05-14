import React, { useState, useEffect, useRef } from "react";

const DropdownInput = ({
  name,
  label,
  emoji,
  options,
  value,
  onChange,
  isInputType,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!value) {
          setSearchText("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  useEffect(() => {
    if (isInputType && value) {
      const selectedOption = options.find((opt) => opt.id === value);
      if (selectedOption) {
        setSearchText(selectedOption.name);
      }
    }
  }, [value, options, isInputType]);

  const filteredOptions =
    isInputType && searchText
      ? options.filter((option) =>
          option.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : options;

  const handleInputChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);
    setIsOpen(true);

    onChange({
      target: {
        name,
        value: null,
        isDropdownInput: true,
      },
    });
  };

  const handleOptionSelect = (option) => {
    if (isInputType) {
      setSearchText(option.name);
      setIsOpen(false);
      onChange({
        target: {
          name,
          value: option.id,
          isDropdownInput: true,
        },
      });
    } else {
      setIsOpen(false);
      onChange({
        target: {
          name,
          value: option.value,
        },
      });
    }
  };

  return (
    <div
      className="referral-form-control-input-container-dropdown"
      ref={dropdownRef}
    >
      {isInputType ? (
        <div
          className="referral-form-control-input-container"
          style={
            style && style.referralInputContainer
              ? style.referralInputContainer
              : null
          }
        >
          {emoji && (
            <img
              src={emoji}
              className="referral-form-control-input-emoji"
              alt={label}
            />
          )}
          <input
            className="referral-form-control-input"
            type="text"
            name={name}
            placeholder={label}
            value={searchText}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
          />
        </div>
      ) : (
        <div
          className="referral-form-control-input-container"
          style={
            style && style.referralInputContainer
              ? style.referralInputContainer
              : null
          }
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="referral-select-selected">
            <div>
              {emoji && (
                <img
                  src={emoji}
                  className="referral-form-control-input-emoji"
                  alt={label}
                />
              )}
            </div>
            <div
              className={`referral-dropdown-filter-element-title ${
                !value ? "city-dropdown-filter-element-title-disabled" : ""
              }`}
            >
              {value || label}
            </div>
            <div>
              <span className="referral-dropdown-chevron" aria-hidden>
                ▼
              </span>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="referral-select-items">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className="city-dropdown-filter-element-option"
              onClick={() => handleOptionSelect(option)}
              role="option"
            >
              {isInputType ? option.name : option.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownInput;
