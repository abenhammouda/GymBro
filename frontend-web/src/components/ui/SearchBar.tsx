import React, { type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';



interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search...',
    onSearch,
    className = '',
    ...props
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <div className={`search-bar ${className}`}>
            <Search className="search-bar__icon" size={18} />
            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                onChange={handleChange}
                {...props}
            />
        </div>
    );
};

export default SearchBar;
