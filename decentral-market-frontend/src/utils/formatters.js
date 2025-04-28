// Format address for display
export const formatAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  if (address.length < start + end) return address;
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format timestamp to date and time
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

// Format price in USD
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return `$${parseFloat(price).toFixed(2)}`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format status for display
export const formatStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Get IPFS URL from hash
export const getIpfsUrl = (hash) => {
  if (!hash) return '/placeholder-product.jpg';
  return `${process.env.REACT_APP_IPFS_GATEWAY}/${hash}`;
};

// Format blockchain transaction hash
export const formatTransactionHash = (hash, start = 10, end = 8) => {
  if (!hash) return '';
  if (hash.length < start + end) return hash;
  return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;
};