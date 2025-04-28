// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MarketplaceContract
 * @dev Handles user roles, product listings, purchases, and delivery confirmations
 */
contract MarketplaceContract {
    // Structs
    struct User {
        address walletAddress;
        bool isSeller;
        bool isAdmin;
        uint256 registrationDate;
    }
    
    struct Product {
        uint256 id;
        address seller;
        string ipfsHash;  // IPFS hash for product details (metadata, images)
        uint256 price;
        bool isAvailable;
        uint256 listingDate;
    }
    
    struct Transaction {
        uint256 id;
        uint256 productId;
        address buyer;
        address seller;
        uint256 price;
        bool isDelivered;
        uint256 purchaseDate;
        uint256 deliveryDate;
    }
    
    // State Variables
    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Transaction) public transactions;
    
    uint256 private productCounter = 0;
    uint256 private transactionCounter = 0;
    address public owner;
    
    // Events
    event UserRegistered(address userAddress, bool isSeller, bool isAdmin);
    event SellerStatusChanged(address userAddress, bool isSeller);
    event ProductListed(uint256 productId, address seller, uint256 price);
    event ProductPurchased(uint256 transactionId, uint256 productId, address buyer, address seller);
    event DeliveryConfirmed(uint256 transactionId, uint256 deliveryDate);
    
    // Constructor
    constructor() {
        owner = msg.sender;
        users[msg.sender] = User(msg.sender, true, true, block.timestamp);
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(users[msg.sender].isAdmin, "Only admins can perform this action");
        _;
    }
    
    modifier onlySeller() {
        require(users[msg.sender].isSeller, "Only sellers can perform this action");
        _;
    }
    
    modifier onlyBuyerOrSeller(uint256 _transactionId) {
        require(
            msg.sender == transactions[_transactionId].buyer || 
            msg.sender == transactions[_transactionId].seller,
            "Only buyer or seller of this transaction can perform this action"
        );
        _;
    }
    
    // User Management Functions
    function registerUser() public {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        users[msg.sender] = User(msg.sender, false, false, block.timestamp);
        emit UserRegistered(msg.sender, false, false);
    }
    
    function setSellerStatus(address _userAddress, bool _isSeller) public onlyAdmin {
        require(users[_userAddress].walletAddress != address(0), "User not registered");
        users[_userAddress].isSeller = _isSeller;
        emit SellerStatusChanged(_userAddress, _isSeller);
    }
    
    function setAdminStatus(address _userAddress, bool _isAdmin) public {
        require(msg.sender == owner, "Only contract owner can set admin status");
        users[_userAddress].isAdmin = _isAdmin;
    }
    
    // Product Functions
    function listProduct(string memory _ipfsHash, uint256 _price) public onlySeller returns (uint256) {
        productCounter++;
        products[productCounter] = Product(
            productCounter,
            msg.sender,
            _ipfsHash,
            _price,
            true,
            block.timestamp
        );
        
        emit ProductListed(productCounter, msg.sender, _price);
        return productCounter;
    }
    
    function buyProduct(uint256 _productId) public payable returns (uint256) {
        Product storage product = products[_productId];
        
        require(product.id != 0, "Product does not exist");
        require(product.isAvailable, "Product is not available");
        require(msg.value >= product.price, "Insufficient funds sent");
        require(msg.sender != product.seller, "Seller cannot buy their own product");
        
        // Transfer funds to seller
        payable(product.seller).transfer(msg.value);
        
        // Mark product as unavailable
        product.isAvailable = false;
        
        // Create transaction record
        transactionCounter++;
        transactions[transactionCounter] = Transaction(
            transactionCounter,
            _productId,
            msg.sender,
            product.seller,
            product.price,
            false,
            block.timestamp,
            0
        );
        
        emit ProductPurchased(transactionCounter, _productId, msg.sender, product.seller);
        return transactionCounter;
    }
    
    function confirmDelivery(uint256 _transactionId) public {
        Transaction storage transaction = transactions[_transactionId];
        
        require(transaction.id != 0, "Transaction does not exist");
        require(msg.sender == transaction.seller, "Only seller can confirm delivery");
        require(!transaction.isDelivered, "Delivery already confirmed");
        
        transaction.isDelivered = true;
        transaction.deliveryDate = block.timestamp;
        
        emit DeliveryConfirmed(_transactionId, transaction.deliveryDate);
    }
    
    // Helper Functions
    function getProductDetails(uint256 _productId) public view returns (
        uint256 id,
        address seller,
        string memory ipfsHash,
        uint256 price,
        bool isAvailable
    ) {
        Product memory product = products[_productId];
        require(product.id != 0, "Product does not exist");
        
        return (
            product.id,
            product.seller,
            product.ipfsHash,
            product.price,
            product.isAvailable
        );
    }
    
    function getTransactionDetails(uint256 _transactionId) public view 
    onlyBuyerOrSeller(_transactionId) returns (
        uint256 id,
        uint256 productId,
        address buyer,
        address seller,
        uint256 price,
        bool isDelivered,
        uint256 purchaseDate,
        uint256 deliveryDate
    ) {
        Transaction memory transaction = transactions[_transactionId];
        require(transaction.id != 0, "Transaction does not exist");
        
        return (
            transaction.id,
            transaction.productId,
            transaction.buyer,
            transaction.seller,
            transaction.price,
            transaction.isDelivered,
            transaction.purchaseDate,
            transaction.deliveryDate
        );
    }
    
    // Check if address is a seller
    function isSeller(address _userAddress) public view returns (bool) {
        return users[_userAddress].isSeller;
    }
    
    // Check if address is an admin
    function isAdmin(address _userAddress) public view returns (bool) {
        return users[_userAddress].isAdmin;
    }
}